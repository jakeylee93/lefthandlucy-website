#!/usr/bin/env python3
"""
Left Hand Lucy -- procedural LEFT hand, authored entirely in Blender (bpy).

    python3 build_hand.py                 # full build: model, rig, poses, renders, sheet
    python3 build_hand.py --preview ok,fist   # quick 384px look at some final poses
    python3 build_hand.py --views         # rest-pose turnaround of the bare model

Everything (mesh, armature, weights, poses, camera, lights, material) is generated
by this script. No third-party model or texture is used.

Conventions (rest pose, Blender world axes, units = centimetres):
    fingers point +Z, palm faces -Y (towards the camera), thumb is on -X.
    The camera sits on -Y looking +Y, so image-right = +X.
    A LEFT hand seen from the palm side has its thumb on the viewer's LEFT.
"""
import argparse
import math
import os
import sys

import bpy
import bmesh
import numpy as np
from mathutils import Matrix, Vector, Euler, Quaternion

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.normpath(os.path.join(HERE, "..", "..", "public", "hand"))
SCRATCH = os.environ.get(
    "HAND_SCRATCH",
    "/tmp/claude-0/-home-user/a3f2ed03-c214-53b3-8842-6693fa9275de/scratchpad/hand-work",
)
if not os.path.isdir(os.path.dirname(SCRATCH)):
    SCRATCH = os.path.join(HERE, "_build")

BRAND_HEX = "#436c57"
CREAM_HEX = "#faf8f3"
POSE_ORDER = ["wave", "thumbsUp", "ok", "pointRight", "pointDown", "peace", "three", "palm", "fist"]
CELL = 192
FRAMES = 9          # columns: frame 0 = hub ... frame 8 = pose
RENDER_PX = 384     # rendered at 2x then downsampled to CELL
SAMPLES = 40
VOXEL = 0.085

# --------------------------------------------------------------------------
# Anatomy table (cm).  x<0 is the thumb (radial) side.
# --------------------------------------------------------------------------
def _dir(spread_deg):
    a = math.radians(spread_deg)
    return Vector((math.sin(a), 0.0, math.cos(a)))


FINGERS = {
    #          MCP joint centre        phalanx lengths      radii @ MCP,PIP,DIP,tip   rest splay
    "index":  dict(mcp=(-2.95, 0.05, 9.30), lens=(3.95, 2.35, 1.78), radii=(1.27, 1.15, 1.06, 0.96), splay=-9.0),
    "middle": dict(mcp=(-0.85, 0.00, 9.80), lens=(4.30, 2.65, 1.88), radii=(1.30, 1.18, 1.08, 0.98), splay=-2.0),
    "ring":   dict(mcp=(1.27, 0.05, 9.40), lens=(3.95, 2.45, 1.80), radii=(1.24, 1.12, 1.03, 0.93), splay=5.0),
    "pinky":  dict(mcp=(3.20, 0.20, 8.45), lens=(3.15, 1.80, 1.62), radii=(1.10, 0.99, 0.91, 0.83), splay=13.0),
}
THUMB = dict(
    cmc=(-2.55, -0.75, 2.30),
    dirs=((-0.60, -0.42, 0.68), (-0.44, -0.36, 0.82), (-0.30, -0.30, 0.90)),
    lens=(4.30, 3.00, 2.45),
    radii=(1.66, 1.44, 1.30, 1.15),
    pad=(0.62, -0.78, 0.0),      # direction the thumb pad faces (towards the palm/index)
)
PIVOT = Vector((0.0, 0.0, 5.0))   # whole-hand rotations pivot about the palm centre


def finger_joints(name):
    f = FINGERS[name]
    p = Vector(f["mcp"])
    d = _dir(f["splay"])
    pts = [p.copy()]
    for L in f["lens"]:
        p = p + d * L
        pts.append(p.copy())
    return pts, d


def thumb_joints():
    p = Vector(THUMB["cmc"])
    pts = [p.copy()]
    for d, L in zip(THUMB["dirs"], THUMB["lens"]):
        p = p + Vector(d).normalized() * L
        pts.append(p.copy())
    return pts


# --------------------------------------------------------------------------
# Modelling helpers
# --------------------------------------------------------------------------
def _sphere(bm, c, r, scale=(1, 1, 1), sub=3):
    m = Matrix.Translation(Vector(c)) @ Matrix.Diagonal((scale[0], scale[1], scale[2], 1.0))
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r, matrix=m)


def _cone(bm, p0, p1, r0, r1, flat=1.0):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    L = d.length
    rot = d.to_track_quat("Z", "Y").to_matrix().to_4x4()
    m = Matrix.Translation((p0 + p1) / 2) @ rot @ Matrix.Diagonal((1.0, flat, 1.0, 1.0))
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=28,
                          radius1=r0, radius2=r1, depth=L, matrix=m)


def _hull(bm_out, spheres):
    """Convex hull of a set of (centre, radius[, scale]) spheres, appended to bm_out."""
    bm = bmesh.new()
    for s in spheres:
        _sphere(bm, s[0], s[1], s[2] if len(s) > 2 else (1, 1, 1))
    ret = bmesh.ops.convex_hull(bm, input=bm.verts[:])
    junk = [g for g in ret["geom_interior"] + ret["geom_unused"] if g.is_valid]
    junk_v = [g for g in junk if isinstance(g, bmesh.types.BMVert)]
    if junk_v:
        bmesh.ops.delete(bm, geom=junk_v, context="VERTS")
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new("tmp_hull")
    bm.to_mesh(me)
    bm.free()
    bm_out.from_mesh(me)
    bpy.data.meshes.remove(me)


def build_blockout():
    """Overlapping closed primitives describing the hand volume."""
    bm = bmesh.new()

    # --- palm slab: hull of rounded pads at the wrist corners and the four knuckles
    mc = {n: Vector(FINGERS[n]["mcp"]) for n in FINGERS}
    fl = (1, 0.80, 1)
    palm = [
        ((-1.95, 0.05, 1.40), 1.55, fl), ((2.30, 0.05, 1.20), 1.55, fl),
        ((-2.9, 0.10, 4.6), 1.35, fl), ((3.35, 0.1, 4.6), 1.30, fl),
        (mc["index"] + Vector((-0.02, 0.05, -0.25)), 1.26, (1, 0.86, 1)),
        (mc["middle"] + Vector((0, 0.05, -0.25)), 1.28, (1, 0.86, 1)),
        (mc["ring"] + Vector((0, 0.05, -0.25)), 1.24, (1, 0.86, 1)),
        (mc["pinky"] + Vector((0.02, 0.0, -0.20)), 1.12, (1, 0.86, 1)),
    ]
    _hull(bm, palm)

    # --- dorsal knuckle heads (subtle bumps on the back of the hand)
    for n in FINGERS:
        r = FINGERS[n]["radii"][0]
        _sphere(bm, mc[n] + Vector((0, 0.30, 0.0)), r * 0.98, (1, 0.9, 1))

    # --- palmar pad under the finger roots
    _hull(bm, [(mc[n] + Vector((0, -0.42, -0.75)), 0.98 if n != "pinky" else 0.88, (1, 0.8, 1)) for n in FINGERS])

    # --- hypothenar eminence (little-finger side heel)
    _hull(bm, [((2.55, -0.42, 1.8), 1.55, (1.1, 0.85, 1)), ((3.05, -0.38, 4.6), 1.30, (1.1, 0.85, 1)),
               ((3.25, -0.22, 6.8), 1.0, (1.1, 0.85, 1))])

    # --- wrist + short forearm stub
    _hull(bm, [((-1.50, 0.15, -1.5), 1.62, (1, 0.9, 1)), ((1.50, 0.15, -1.5), 1.62, (1, 0.9, 1)),
               ((-1.50, 0.10, 1.6), 1.70, (1, 0.9, 1)), ((1.65, 0.10, 1.6), 1.70, (1, 0.9, 1))])

    # --- thumb: metacarpal wrapped in the thenar eminence + first web space
    tj = thumb_joints()
    tr = THUMB["radii"]
    _hull(bm, [(tj[0] + Vector((0.25, -0.15, -0.2)), 1.72), (tj[1], tr[1] * 1.03),
               ((-2.2, -0.55, 4.6), 1.25, (1, 0.85, 1))])
    _hull(bm, [(tj[1], tr[1] * 0.92), ((-3.1, -0.15, 7.1), 0.82, (1, 0.8, 1)), ((-2.7, -0.3, 4.2), 1.0)])
    # phalanges
    _sphere(bm, tj[1], tr[1] * 1.03)
    _cone(bm, tj[1], tj[2], tr[1] * 0.97, tr[2] * 0.98)
    _sphere(bm, tj[2], tr[2] * 1.04)
    _cone(bm, tj[2], tj[3], tr[2] * 0.98, tr[3])
    _sphere(bm, tj[3], tr[3])
    # thumb pad
    pad = Vector(THUMB["pad"]).normalized()
    _sphere(bm, tj[2].lerp(tj[3], 0.62) + pad * 0.16, tr[3] * 0.98, (1, 1, 1))

    # --- fingers
    for n in FINGERS:
        pts, d = finger_joints(n)
        r = FINGERS[n]["radii"]
        for i in range(3):
            # slightly waisted phalanx: two cones meeting at a mid radius
            mid = pts[i].lerp(pts[i + 1], 0.5)
            rm = (r[i] + r[i + 1]) / 2 * (0.975 if i < 2 else 0.99)
            _cone(bm, pts[i], mid, r[i] * 0.97, rm, flat=0.94)
            _cone(bm, mid, pts[i + 1], rm, r[i + 1] * 0.97, flat=0.94)
        _sphere(bm, pts[0], r[0] * 0.98, (1, 0.94, 1))
        _sphere(bm, pts[1], r[1] * 1.0, (1, 0.95, 1))
        _sphere(bm, pts[2], r[2] * 1.0, (1, 0.95, 1))
        _sphere(bm, pts[3], r[3], (1, 0.92, 1.12))
        # finger pads (palmar side)
        _sphere(bm, pts[2].lerp(pts[3], 0.62) + Vector((0, -0.10, 0)), r[3] * 0.98)
        _sphere(bm, pts[0].lerp(pts[1], 0.55) + Vector((0, -0.10, 0)), r[0] * 0.90, (1, 1, 1.7))
        _sphere(bm, pts[1].lerp(pts[2], 0.50) + Vector((0, -0.08, 0)), r[1] * 0.92, (1, 1, 1.4))

    me = bpy.data.meshes.new("hand_blockout")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("hand_blockout", me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def _apply_modifiers_to_new_mesh(ob, name):
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg), depsgraph=dg)
    me.name = name
    return me


def build_mesh():
    """Blockout -> voxel remesh (union) -> masked smoothing (strong on the palm,
    light on the digits so they keep their girth) -> remesh -> light smooth."""
    blk = build_blockout()
    m = blk.modifiers.new("Remesh", "REMESH")
    m.mode = "VOXEL"
    m.voxel_size = VOXEL
    m.adaptivity = 0.0
    me1 = _apply_modifiers_to_new_mesh(blk, "hand_stage1")
    blk.modifiers.clear()
    # keep the blockout in the file (hidden) as the modelling source
    src = bpy.data.collections.new("source_blockout")
    bpy.context.scene.collection.children.link(src)
    bpy.context.scene.collection.objects.unlink(blk)
    src.objects.link(blk)
    blk.hide_render = True
    blk.hide_viewport = True
    src.hide_render = True

    tmp = bpy.data.objects.new("hand_stage1", me1)
    bpy.context.scene.collection.objects.link(tmp)
    n = len(me1.vertices)
    P = np.empty(n * 3)
    me1.vertices.foreach_get("co", P)
    P = P.reshape(n, 3)
    owner, U, DN, cn = chain_coords(P)
    mask = np.ones(n)
    for ci, c in enumerate(cn):
        pts = chain_table()[c][0]
        u = U[:, ci]
        if c == "thumb":
            L0 = (pts[1] - pts[0]).length
            k = _smoothstep(L0 - 0.8, L0 + 1.0, u)
        else:
            k = _smoothstep(0.0, 2.0, u)
        sel = owner == ci
        mask[sel] = 1.0 - 0.90 * k[sel]
    vg = tmp.vertex_groups.new(name="palm_smooth")
    for i in range(n):
        vg.add([i], float(mask[i]), "REPLACE")
    s = tmp.modifiers.new("SmoothPalm", "SMOOTH")
    s.factor = 0.5
    s.iterations = 160
    s.vertex_group = "palm_smooth"
    m2 = tmp.modifiers.new("Remesh2", "REMESH")
    m2.mode = "VOXEL"
    m2.voxel_size = VOXEL * 1.25
    s2 = tmp.modifiers.new("Smooth2", "SMOOTH")
    s2.factor = 0.5
    s2.iterations = 3
    me = _apply_modifiers_to_new_mesh(tmp, "Hand")
    bpy.data.objects.remove(tmp)
    bpy.data.meshes.remove(me1)

    ob = bpy.data.objects.new("Hand", me)
    bpy.context.scene.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = True
    return ob


# --------------------------------------------------------------------------
# Rig
# --------------------------------------------------------------------------
def chain_table():
    """name -> (joint points, radii, bone names)"""
    t = {}
    for n in FINGERS:
        pts, _ = finger_joints(n)
        t[n] = (pts, FINGERS[n]["radii"], [f"{n}.01", f"{n}.02", f"{n}.03"])
    t["thumb"] = (thumb_joints(), THUMB["radii"], ["thumb.00", "thumb.01", "thumb.02"])
    return t


def build_armature():
    arm = bpy.data.armatures.new("HandRig")
    ob = bpy.data.objects.new("HandRig", arm)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm.edit_bones
    w = eb.new("wrist")
    w.head = (0, 0, -2.6)
    w.tail = (0, 0, 0.6)
    w.align_roll(Vector((0, -1, 0)))
    for n, (pts, radii, names) in chain_table().items():
        parent = w
        for i, bn in enumerate(names):
            b = eb.new(bn)
            b.head = pts[i]
            b.tail = pts[i + 1]
            b.parent = parent
            b.use_connect = i > 0
            if n == "thumb":
                d = (pts[i + 1] - pts[i]).normalized()
                pad = Vector(THUMB["pad"])
                pad = (pad - d * pad.dot(d)).normalized()
                b.align_roll(pad)       # local Z = pad direction, +X rotation = flexion
            else:
                b.align_roll(Vector((0, -1, 0)))   # local Z = palm normal, +X rotation = flexion
            parent = b
    bpy.ops.object.mode_set(mode="OBJECT")
    for pb in ob.pose.bones:
        pb.rotation_mode = "QUATERNION"
    arm.display_type = "STICK"
    ob.show_in_front = True
    ob.hide_render = True
    return ob


def _seg(P, a, b):
    a = np.array(a); b = np.array(b)
    ab = b - a
    L2 = float(ab @ ab)
    t_raw = ((P - a) @ ab) / L2
    t = np.clip(t_raw, 0, 1)
    d = np.linalg.norm(P - (a + t[:, None] * ab), axis=1)
    return d, t, t_raw, math.sqrt(L2)


def _smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def chain_coords(P):
    """For points P: owning digit chain, arc position along each chain (cm from its
    first joint, negative behind it) and radius-normalised distance to each chain."""
    n = len(P)
    chains = chain_table()
    cn = list(chains.keys())
    DN = np.zeros((n, len(cn)))
    U = np.zeros((n, len(cn)))
    for ci, c in enumerate(cn):
        pts, radii, _ = chains[c]
        best = np.full(n, 1e9)
        acc = 0.0
        for i in range(3):
            d, t, t_raw, L = _seg(P, pts[i], pts[i + 1])
            r = radii[i] + (radii[i + 1] - radii[i]) * t
            dn = d / r
            if i == 0:
                u = acc + t_raw * L
            elif i == 2:
                u = acc + np.maximum(t_raw, 0) * L
            else:
                u = acc + t * L
            better = dn < best
            U[better, ci] = u[better]
            best = np.where(better, dn, best)
            acc += L
        DN[:, ci] = best
    return np.argmin(DN, axis=1), U, DN, cn


def compute_weights(hand, rig):
    me = hand.data
    n = len(me.vertices)
    P = np.empty(n * 3)
    me.vertices.foreach_get("co", P)
    P = P.reshape(n, 3)
    chains = chain_table()
    names = ["wrist"] + [b for c in chains.values() for b in c[2]]
    idx = {b: i for i, b in enumerate(names)}
    W = np.zeros((n, len(names)))

    owner, U, DN, cn = chain_coords(P)
    # palm skeleton: wrist centre -> each knuckle
    dpalm = np.full(n, 1e9)
    for f in FINGERS:
        d, _, _, _ = _seg(P, (0.3, 0.1, 0.6), Vector(FINGERS[f]["mcp"]) + Vector((0, 0.1, -0.6)))
        dpalm = np.minimum(dpalm, d / 1.45)
    d, _, _, _ = _seg(P, (0, 0.1, -3.0), (0.2, 0.1, 1.0))
    dpalm = np.minimum(dpalm, d / 2.2)

    for ci, c in enumerate(cn):
        pts, radii, bones = chains[c]
        sel = owner == ci
        u = U[:, ci]
        L0 = (pts[1] - pts[0]).length
        L1 = (pts[2] - pts[1]).length
        if c == "thumb":
            comp = 1.0 / (1.0 + np.exp(-3.2 * (dpalm - DN[:, ci] - 0.10)))
            g = comp * _smoothstep(-0.6, 1.6, u)
            g = np.maximum(g, _smoothstep(L0 - 0.8, L0 + 0.3, u))
        else:
            g = _smoothstep(-1.15, 0.75, u)
        bw1 = radii[1] * 0.75
        bw2 = radii[2] * 0.75
        p1 = _smoothstep(L0 - bw1, L0 + bw1, u)
        p2 = _smoothstep(L0 + L1 - bw2, L0 + L1 + bw2, u)
        w0 = g * (1 - p1)
        w1 = g * p1 * (1 - p2)
        w2 = g * p1 * p2
        W[sel, idx[bones[0]]] = w0[sel]
        W[sel, idx[bones[1]]] = w1[sel]
        W[sel, idx[bones[2]]] = w2[sel]
        W[sel, 0] = (1 - g)[sel]

    # Laplacian smoothing of the weights across the surface
    E = np.empty(len(me.edges) * 2, dtype=np.int64)
    me.edges.foreach_get("vertices", E)
    E = E.reshape(-1, 2)
    deg = np.zeros(n)
    np.add.at(deg, E[:, 0], 1)
    np.add.at(deg, E[:, 1], 1)
    for _ in range(10):
        S = np.zeros_like(W)
        np.add.at(S, E[:, 0], W[E[:, 1]])
        np.add.at(S, E[:, 1], W[E[:, 0]])
        W = 0.4 * W + 0.6 * S / deg[:, None]
    W[W < 0.01] = 0
    W /= W.sum(axis=1, keepdims=True)

    for b in names:
        vg = hand.vertex_groups.new(name=b)
        col = W[:, idx[b]]
        nz = np.nonzero(col)[0]
        for i in nz:
            vg.add([int(i)], float(col[i]), "REPLACE")


def bind(hand, rig):
    compute_weights(hand, rig)
    hand.parent = rig
    am = hand.modifiers.new("Armature", "ARMATURE")
    am.object = rig
    am.use_deform_preserve_volume = True
    cs = hand.modifiers.new("CorrectiveSmooth", "CORRECTIVE_SMOOTH")
    cs.factor = 0.5
    cs.iterations = 6
    cs.smooth_type = "SIMPLE"
    cs.rest_source = "ORCO"
    ss = hand.modifiers.new("Subdivision", "SUBSURF")
    ss.levels = 0
    ss.render_levels = 1


# --------------------------------------------------------------------------
# Look: material, lights, camera
# --------------------------------------------------------------------------
def _srgb_to_lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_lin(h):
    h = h.lstrip("#")
    return tuple(_srgb_to_lin(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4))


def build_look(hand):
    mat = bpy.data.materials.new("SageClay")
    mat.use_nodes = True
    bsdf = next(nd for nd in mat.node_tree.nodes if nd.type == "BSDF_PRINCIPLED")
    r, g, b = hex_lin(BRAND_HEX)
    k = 1.12   # albedo lift so the lit mid-tones land on the brand colour
    bsdf.inputs["Base Color"].default_value = (min(r * k, 1), min(g * k, 1), min(b * k, 1), 1)
    bsdf.inputs["Roughness"].default_value = 0.52
    for nm, v in (("Specular IOR Level", 0.35), ("Sheen Weight", 0.25), ("Sheen Roughness", 0.5),
                  ("Coat Weight", 0.06), ("Coat Roughness", 0.35)):
        if nm in bsdf.inputs:
            bsdf.inputs[nm].default_value = v
    hand.data.materials.append(mat)

    sc = bpy.context.scene
    world = bpy.data.worlds.new("SoftAmbient")
    world.use_nodes = True
    bg = next(nd for nd in world.node_tree.nodes if nd.type == "BACKGROUND")
    bg.inputs[0].default_value = (0.82, 0.90, 0.86, 1)
    bg.inputs[1].default_value = 0.30
    sc.world = world

    def area(name, loc, size, energy, color=(1, 1, 1)):
        L = bpy.data.lights.new(name, "AREA")
        L.shape = "DISK"
        L.size = size
        L.energy = energy
        L.color = color
        o = bpy.data.objects.new(name, L)
        o.location = loc
        d = PIVOT - Vector(loc)
        o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        sc.collection.objects.link(o)
        return o

    area("Key", (-26, -40, 34), 26, 30000, (1.0, 0.975, 0.94))
    area("Fill", (34, -34, 2), 40, 7000, (0.90, 0.96, 1.0))
    area("Rim", (22, 36, 30), 18, 30000, (1.0, 1.0, 1.0))
    area("RimLow", (-30, 30, -12), 18, 10000, (0.95, 1.0, 0.97))

    cam = bpy.data.cameras.new("Cam")
    cam.type = "ORTHO"
    cam.ortho_scale = 25.0
    cam.clip_start = 1
    cam.clip_end = 200
    co = bpy.data.objects.new("Cam", cam)
    co.location = (0, -60, PIVOT.z)
    co.rotation_euler = (math.radians(90), 0, 0)
    sc.collection.objects.link(co)
    sc.camera = co

    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = SAMPLES
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = "OPENIMAGEDENOISE"
    except Exception as e:  # pragma: no cover
        print("OIDN unavailable:", e)
    sc.cycles.max_bounces = 4
    sc.render.threads_mode = "AUTO"
    sc.render.film_transparent = True
    sc.render.resolution_x = RENDER_PX
    sc.render.resolution_y = RENDER_PX
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.render.fps = 30
    sc.frame_start = 0
    sc.frame_end = FRAMES - 1
    return co


# --------------------------------------------------------------------------
# Poses
# --------------------------------------------------------------------------
# finger: (MCP flex, PIP flex, DIP flex, spread)   degrees; spread>0 = towards the thumb side
# thumb : ((flex, twist, abd) metacarpal, (flex, twist, abd) proximal, flex distal)
#         flex>0 curls towards the pad; abd is rotation about the pad axis
# root  : (rx, ry, rz) world Euler XYZ in degrees about the palm centre; ry is "roll in the image plane"
def T(d0, d1, d2, twist=(0, 0, 0)):
    """Thumb pose given as target directions (hand rest frame: x<0 thumb side,
    y<0 palmar, z towards the fingertips) for metacarpal, proximal and distal
    phalanx, plus optional twist (deg) about each bone's own axis."""
    return dict(dirs=(d0, d1, d2), twist=twist)


def F(mcp, pip, dip, spread=0.0):
    return (mcp, pip, dip, spread)


CURL = dict(index=F(84, 102, 62, 0), middle=F(86, 104, 62, 0), ring=F(88, 104, 60, -3), pinky=F(90, 100, 58, -8))

POSES = {
    "hub": dict(
        root=(6, 0, 12),
        index=F(10, 16, 9, 3), middle=F(13, 19, 10, 0), ring=F(16, 22, 11, -2), pinky=F(19, 24, 12, -5),
        thumb=T((-0.62, -0.45, 0.64), (-0.42, -0.42, 0.80), (-0.25, -0.40, 0.88)),
    ),
    "wave": dict(
        root=(0, -11, 4),
        index=F(-3, 3, 2, 7), middle=F(-4, 3, 2, 2), ring=F(-3, 4, 2, -5), pinky=F(-2, 5, 3, -10),
        thumb=T((-0.75, -0.25, 0.60), (-0.72, -0.15, 0.68), (-0.70, -0.08, 0.71)),
    ),
    "fist": dict(
        root=(8, 6, 28),
        **CURL,
        thumb=T((-0.32, -0.78, 0.55), (0.37, -0.63, 0.68), (0.92, -0.15, 0.36)),
    ),
    "thumbsUp": dict(
        root=(0, 90, 0), pre=(0, 0, 24),
        **CURL,
        thumb=T((-0.80, -0.30, 0.52), (-0.97, -0.12, 0.20), (-0.99, 0.0, 0.12)),
    ),
    "ok": dict(
        root=(4, -4, 44),
        index=F(52, 62, 34, 2), middle=F(4, 8, 5, -1), ring=F(-2, 6, 4, -9), pinky=F(-6, 5, 4, -19),
        thumb=T((-0.30, -0.80, 0.52), (-0.05, -0.62, 0.78), (0.25, -0.45, 0.86)),
        touch=("index", 0.2),
    ),
    "pointRight": dict(
        root=(0, 90, 0), pre=(0, 0, 20),
        index=F(0, 3, 2, 0), middle=CURL["middle"], ring=CURL["ring"], pinky=CURL["pinky"],
        thumb=T((-0.32, -0.78, 0.55), (0.37, -0.63, 0.68), (0.92, -0.15, 0.36)),
    ),
    "pointDown": dict(
        root=(0, 180, 0), pre=(0, 0, 20),
        index=F(0, 3, 2, 0), middle=CURL["middle"], ring=CURL["ring"], pinky=CURL["pinky"],
        thumb=T((-0.32, -0.78, 0.55), (0.37, -0.63, 0.68), (0.92, -0.15, 0.36)),
    ),
    "peace": dict(
        root=(4, 0, 10),
        index=F(-2, 3, 2, 11), middle=F(-2, 3, 2, -9), ring=CURL["ring"], pinky=CURL["pinky"],
        thumb=T((-0.05, -0.82, 0.57), (0.62, -0.48, 0.62), (0.93, -0.20, 0.30)),
    ),
    "three": dict(
        root=(4, 0, 10),
        index=F(-2, 3, 2, 11), middle=F(-3, 3, 2, 1), ring=F(-2, 4, 2, -9), pinky=CURL["pinky"],
        thumb=T((0.12, -0.85, 0.50), (0.75, -0.40, 0.52), (0.96, 0.0, 0.27)),
    ),
    "palm": dict(
        root=(0, 90, 0), pre=(0, 0, 0), post=(-58, 0, 0),
        index=F(6, 10, 6, 1), middle=F(8, 12, 7, 2), ring=F(9, 13, 7, -1), pinky=F(10, 14, 8, -3),
        thumb=T((-0.66, -0.40, 0.64), (-0.50, -0.38, 0.78), (-0.36, -0.36, 0.86)),
    ),
}


def thumb_quats(spec):
    rig = bpy.data.objects["HandRig"]
    out = {}
    Rp = Quaternion()                       # accumulated rest->posed rotation of the parent
    for i, bn in enumerate(("thumb.00", "thumb.01", "thumb.02")):
        b = rig.data.bones[bn]
        Rrest = b.matrix_local.to_quaternion()
        rest_dir = (b.tail_local - b.head_local).normalized()
        cur = Rp @ rest_dir
        tgt = Vector(spec["dirs"][i]).normalized()
        D = cur.rotation_difference(tgt)
        A = D @ Rp
        q = Rrest.inverted() @ Rp.inverted() @ A @ Rrest
        tw = spec["twist"][i]
        if tw:
            q = q @ Quaternion((0, 1, 0), math.radians(tw))
            A = Rp @ (Rrest @ q @ Rrest.inverted())
        out[bn] = q
        Rp = A
    return out


def _rq(e):
    return Euler([math.radians(v) for v in e], "XYZ").to_quaternion()


def root_quat(p):
    """World rotation of the whole hand. 'pre' is applied first (hand-local yaw etc.),
    then 'root', then 'post' (world)."""
    q = _rq(p.get("root", (0, 0, 0)))
    if "pre" in p:
        q = q @ _rq(p["pre"])
    if "post" in p:
        q = _rq(p["post"]) @ q
    return q


def pose_quats(p):
    """Bone-local quaternions for every finger/thumb bone of pose spec p."""
    out = {}
    for f in FINGERS:
        mcp, pip, dip, spread = p[f]
        out[f"{f}.01"] = Euler((math.radians(mcp), 0, math.radians(spread)), "XYZ").to_quaternion()
        out[f"{f}.02"] = Euler((math.radians(pip), 0, 0), "XYZ").to_quaternion()
        out[f"{f}.03"] = Euler((math.radians(dip), 0, 0), "XYZ").to_quaternion()
    out.update(thumb_quats(p["thumb"]))
    return out


def set_root(rig, q, loc):
    pb = rig.pose.bones["wrist"]
    rest = rig.data.bones["wrist"].matrix_local
    M = (Matrix.Translation(Vector(loc)) @ Matrix.Translation(PIVOT) @ q.to_matrix().to_4x4()
         @ Matrix.Translation(-PIVOT) @ rest)
    pb.matrix = M


def apply_state(rig, state):
    """state = dict(root=Quaternion, loc=Vector, bones={name: Quaternion})"""
    for bn, q in state["bones"].items():
        rig.pose.bones[bn].rotation_quaternion = q
    set_root(rig, state["root"], state["loc"])
    bpy.context.view_layer.update()


def eval_bounds(hand):
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    ev = hand.evaluated_get(dg)
    me = ev.to_mesh()
    n = len(me.vertices)
    P = np.empty(n * 3)
    me.vertices.foreach_get("co", P)
    ev.to_mesh_clear()
    P = P.reshape(n, 3)
    Mw = np.array(ev.matrix_world)
    P = P @ Mw[:3, :3].T + Mw[:3, 3]
    return P.min(axis=0), P.max(axis=0)


def solve_touch(rig, state, finger, gap):
    """Tiny coordinate-descent IK so the thumb tip meets a fingertip (for 'ok')."""
    bones = state["bones"]
    params = [("thumb.00", 0), ("thumb.00", 2), ("thumb.00", 1), ("thumb.01", 0), ("thumb.02", 0),
              (f"{finger}.01", 0), (f"{finger}.02", 0)]
    eul = {b: list(bones[b].to_euler("XYZ")) for b, _ in params}
    start = {b: list(v) for b, v in eul.items()}
    rt = THUMB["radii"][3]
    rf = FINGERS[finger]["radii"][3]
    target = rt + rf - gap

    def cost():
        for b, e in eul.items():
            rig.pose.bones[b].rotation_quaternion = Euler(e, "XYZ").to_quaternion()
        bpy.context.view_layer.update()
        a = rig.pose.bones["thumb.02"]
        f = rig.pose.bones[f"{finger}.03"]
        # pad points: slightly back from the tip, pushed towards the pad side
        ta = a.tail - (a.tail - a.head).normalized() * 0.2
        tf = f.tail - (f.tail - f.head).normalized() * 0.2
        d = (ta - tf).length
        reg = sum((eul[b][i] - start[b][i]) ** 2 for b, i in params) * 0.6
        return (d - target) ** 2 + reg * 0.02

    step = math.radians(8)
    best = cost()
    for _ in range(60):
        improved = False
        for b, i in params:
            for s in (step, -step):
                eul[b][i] += s
                c = cost()
                if c < best - 1e-9:
                    best = c
                    improved = True
                    break
                eul[b][i] -= s
        if not improved:
            step *= 0.5
            if step < math.radians(0.25):
                break
    for b, e in eul.items():
        bones[b] = Euler(e, "XYZ").to_quaternion()
    cost()
    return best


def make_states(rig, hand):
    """Resolve every pose spec into a concrete state (incl. auto-centring in frame)."""
    states = {}
    for name, p in POSES.items():
        st = dict(root=root_quat(p), loc=Vector((0, 0, 0)), bones=pose_quats(p))
        apply_state(rig, st)
        if "touch" in p:
            solve_touch(rig, st, *p["touch"])
            apply_state(rig, st)
        lo, hi = eval_bounds(hand)
        c = (lo + hi) / 2
        st["loc"] = Vector((-c[0], 0.0, PIVOT.z - c[2]))
        st["extent"] = (float(hi[0] - lo[0]), float(hi[2] - lo[2]))
        states[name] = st
    return states


LAG = {"thumb": 0.00, "index": 0.04, "middle": 0.09, "ring": 0.14, "pinky": 0.19, "root": 0.0}
LAG_MAX = max(LAG.values())


def _ease(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)


def blend_state(a, b, t):
    """Eased blend a->b at t in [0,1]; fingers lag one another slightly."""
    def k(group):
        return _ease(t * (1 + LAG_MAX) - LAG[group])
    kr = k("root")
    out = dict(root=a["root"].slerp(b["root"], kr), loc=a["loc"].lerp(b["loc"], kr), bones={})
    for bn in a["bones"]:
        out["bones"][bn] = a["bones"][bn].slerp(b["bones"][bn], k(bn.split(".")[0]))
    return out


def keep_in_frame(rig, hand, st, scale, margin=0.085):
    """Nudge the root so an in-between frame never leaves the safe area of the cell."""
    half = scale * (0.5 - margin)
    lo, hi = eval_bounds(hand)
    shift = Vector((0, 0, 0))
    for ax, c0 in ((0, 0.0), (2, PIVOT.z)):
        over_hi = hi[ax] - (c0 + half)
        over_lo = (c0 - half) - lo[ax]
        if over_hi > 0 and over_lo > 0:
            shift[ax] = (over_lo - over_hi) / 2
        elif over_hi > 0:
            shift[ax] = -over_hi
        elif over_lo > 0:
            shift[ax] = over_lo
    if shift.length > 1e-6:
        st["loc"] = st["loc"] + shift
        apply_state(rig, st)
    return st


def bake_actions(rig, states, hand=None, scale=None):
    """One Action per pose: frame 0 = hub ... frame 8 = pose (every frame keyed)."""
    rig.animation_data_create()
    acts = {}
    for name in ["hub"] + POSE_ORDER:
        act = bpy.data.actions.new(name)
        act.use_fake_user = True
        rig.animation_data.action = act
        prev = {}
        for f in range(FRAMES):
            t = f / (FRAMES - 1)
            st = blend_state(states["hub"], states[name], t)
            apply_state(rig, st)
            if hand is not None and 0 < f < FRAMES - 1:
                keep_in_frame(rig, hand, st, scale)
            for pb in rig.pose.bones:
                q = pb.rotation_quaternion.copy()
                if pb.name in prev and prev[pb.name].dot(q) < 0:
                    q.negate()
                    pb.rotation_quaternion = q
                prev[pb.name] = q
                pb.keyframe_insert("rotation_quaternion", frame=f)
            rig.pose.bones["wrist"].keyframe_insert("location", frame=f)
        acts[name] = act
    return acts


def use_action(rig, act):
    ad = rig.animation_data
    ad.action = act
    if hasattr(ad, "action_slot") and len(getattr(act, "slots", [])):
        ad.action_slot = act.slots[0]


# --------------------------------------------------------------------------
# Rendering + sheet assembly
# --------------------------------------------------------------------------
def render_to(path, px=None):
    sc = bpy.context.scene
    if px:
        sc.render.resolution_x = px
        sc.render.resolution_y = px
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


def fit_camera(cam, states, margin=0.085):
    need = 0.0
    for n, st in states.items():
        need = max(need, st["extent"][0], st["extent"][1])
    cam.data.ortho_scale = need / (1 - 2 * margin)
    return cam.data.ortho_scale


def new_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.scale_length = 0.01
    return sc


def build_all():
    new_scene()
    hand = build_mesh()
    rig = build_armature()
    bind(hand, rig)
    cam = build_look(hand)
    return hand, rig, cam


def downsample(src, size):
    from PIL import Image
    im = Image.open(src).convert("RGBA")
    if im.size != (size, size):
        # premultiplied resize to avoid dark fringes
        im = im.convert("RGBa").resize((size, size), Image.LANCZOS).convert("RGBA")
    return im


def assemble(frame_png, out_dir):
    from PIL import Image, ImageDraw, ImageFont
    os.makedirs(out_dir, exist_ok=True)
    sheet = Image.new("RGBA", (CELL * FRAMES, CELL * len(POSE_ORDER)), (0, 0, 0, 0))
    report = {}
    for r, name in enumerate(POSE_ORDER):
        for c in range(FRAMES):
            im = downsample(frame_png[(name, c)], CELL)
            bb = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
            report[(name, c)] = bb
            sheet.paste(im, (c * CELL, r * CELL))
            if c == FRAMES - 1:
                p = os.path.join(out_dir, f"poster-{name}.webp")
                for q in (82, 74, 66, 58):
                    im.save(p, "WEBP", quality=q, alpha_quality=90, method=6)
                    if os.path.getsize(p) <= 12000:
                        break
    sp = os.path.join(out_dir, "sheet.webp")
    for q in (80, 74, 68, 62, 56):
        sheet.save(sp, "WEBP", quality=q, alpha_quality=88, method=6)
        if os.path.getsize(sp) <= 450_000:
            break
    print("sheet quality", q, os.path.getsize(sp))

    # contact sheet: hub + nine poses at 384px on cream
    big = 384
    pad, lab = 20, 40
    cols = 5
    items = ["hub"] + POSE_ORDER
    rows = math.ceil(len(items) / cols)
    Wd = cols * big + (cols + 1) * pad
    Hd = rows * (big + lab) + (rows + 1) * pad
    cs = Image.new("RGB", (Wd, Hd), CREAM_HEX)
    dr = ImageDraw.Draw(cs)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except Exception:
        font = ImageFont.load_default()
    for i, name in enumerate(items):
        key = ("wave", 0) if name == "hub" else (name, FRAMES - 1)
        im = downsample(frame_png[key], big)
        x = pad + (i % cols) * (big + pad)
        y = pad + (i // cols) * (big + lab + pad)
        cs.paste(im, (x, y), im)
        dr.rectangle([x, y, x + big - 1, y + big - 1], outline="#d9d4c7")
        dr.text((x + 6, y + big + 6), name + ("  (frame 0 of every row)" if name == "hub" else ""),
                fill="#2c4a3b", font=font)
    cs.save(os.path.join(out_dir, "contact-sheet.png"), optimize=True)
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", default="", help="comma separated pose names; render finals only to scratch")
    ap.add_argument("--views", action="store_true", help="turnaround of the rest pose to scratch")
    ap.add_argument("--px", type=int, default=RENDER_PX)
    ap.add_argument("--samples", type=int, default=SAMPLES)
    ap.add_argument("--side", action="store_true", help="with --preview: also render a side/3-4 view")
    ap.add_argument("--mid", default="", help="with --preview: also render these frame numbers, e.g. 3,5")
    args = ap.parse_args()
    os.makedirs(SCRATCH, exist_ok=True)

    hand, rig, cam = build_all()
    sc = bpy.context.scene
    sc.cycles.samples = args.samples
    print("verts", len(hand.data.vertices))

    if args.views:
        views = {"palm": (90, 0, 0), "back": (90, 0, 180), "thumbside": (90, 0, -90), "pinkyside": (90, 0, 90),
                 "q34": (70, 0, -40), "top": (0, 0, 0)}
        for vn, e in views.items():
            q = Euler([math.radians(v) for v in e], "XYZ").to_quaternion()
            cam.rotation_euler = q.to_euler()
            cam.location = Vector((0, 0, 8)) + q @ Vector((0, 0, 60))
            cam.data.ortho_scale = 29
            render_to(os.path.join(SCRATCH, f"view_{vn}.png"), args.px)
        return

    states = make_states(rig, hand)
    scale = fit_camera(cam, states)
    print("ortho scale", scale, {n: tuple(round(v, 1) for v in s["extent"]) for n, s in states.items()})

    if args.preview:
        names = POSE_ORDER + ["hub"] if args.preview == "all" else args.preview.split(",")
        for n in names:
            apply_state(rig, states[n])
            render_to(os.path.join(SCRATCH, f"pv_{n}.png"), args.px)
            if args.side:
                q = Euler((math.radians(72), 0, math.radians(-55)), "XYZ").to_quaternion()
                loc0, rot0 = cam.location.copy(), cam.rotation_euler.copy()
                cam.rotation_euler = q.to_euler()
                cam.location = PIVOT + q @ Vector((0, 0, 60))
                render_to(os.path.join(SCRATCH, f"pv_{n}_side.png"), args.px)
                cam.location, cam.rotation_euler = loc0, rot0
            for f in [int(x) for x in args.mid.split(",") if x]:
                apply_state(rig, blend_state(states["hub"], states[n], f / (FRAMES - 1)))
                render_to(os.path.join(SCRATCH, f"pv_{n}_f{f}.png"), args.px)
        return

    # ---- full build ------------------------------------------------------
    acts = bake_actions(rig, states, hand, scale)
    use_action(rig, acts["hub"])
    sc.frame_set(0)
    blend_path = os.path.join(HERE, "hand.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path, compress=True)

    fdir = os.path.join(SCRATCH, "frames")
    os.makedirs(fdir, exist_ok=True)
    frame_png = {}
    hub_png = os.path.join(fdir, "hub.png")
    use_action(rig, acts[POSE_ORDER[0]])
    sc.frame_set(0)
    render_to(hub_png, RENDER_PX)
    for name in POSE_ORDER:
        use_action(rig, acts[name])
        frame_png[(name, 0)] = hub_png          # identical hub frame for every row
        for f in range(1, FRAMES):
            sc.frame_set(f)
            p = os.path.join(fdir, f"{name}_{f}.png")
            render_to(p, RENDER_PX)
            frame_png[(name, f)] = p
    report = assemble(frame_png, PUBLIC)
    worst = 1e9
    for k, bb in report.items():
        m = min(bb[0], bb[1], CELL - bb[2], CELL - bb[3])
        worst = min(worst, m)
    print("smallest margin px (of %d):" % CELL, worst)
    # leave the file on the hub pose
    use_action(rig, acts["hub"])
    sc.frame_set(0)
    bpy.ops.wm.save_as_mainfile(filepath=blend_path, compress=True)
    print("done")


if __name__ == "__main__":
    main()
