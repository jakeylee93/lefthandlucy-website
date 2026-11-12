# Left Hand Lucy — 3D hand asset

A stylised, anatomically proportioned **left** hand ("sage clay mannequin"), modelled,
rigged, posed and rendered entirely in Blender by `build_hand.py`.

## Provenance

- **Tool:** Blender 5.3.0, used headless through the official `bpy` Python module (`pip install bpy`, PyPI wheel 5.3.0, Python 3.13).
- **Authorship:** mesh, armature, skin weights, poses, camera, lights and material are all generated
  procedurally by `build_hand.py`. **No third-party, stock or downloaded model, scan or texture is used.**
- **Modelling:** a blockout of overlapping Blender primitives (icospheres, tapered cones, convex hulls of spheres
  for the palm slab, thenar/hypothenar eminences, knuckle pad, first web space and wrist stub) is unioned with the
  Remesh modifier (voxel, 0.085 cm), smoothed with a vertex-group-masked Smooth modifier (strong on the palm, light on
  the digits), voxel-remeshed again and lightly smoothed. Result: about 62k vertices. The blockout is kept in the
  `.blend` (hidden collection `source_blockout`).
- **Rig:** armature `HandRig`, 16 bones: `wrist` (root, carries palm + forearm stub), `thumb.00` (metacarpal / CMC joint),
  `thumb.01`, `thumb.02`, and `index|middle|ring|pinky.01-.03` (MCP, PIP, DIP). Finger bones: local +X rotation = flexion,
  local Z = spread. Skin weights are computed by the script (distance to each digit's joint chain, smooth blends across
  each joint, then Laplacian-smoothed over the surface). Modifier stack on `Hand` is left unapplied:
  Armature (preserve volume) -> Corrective Smooth -> Subdivision (render level 1).
- **Poses:** ten Actions in the `.blend`: `hub`, `wave`, `thumbsUp`, `ok`, `pointRight`, `pointDown`, `peace`, `three`,
  `palm`, `fist`. Each action is 9 frames (0-8): frame 0 is the hub pose, frame 8 the named pose, every frame keyed
  (quaternion slerp per bone, smoothstep easing, the fingers lag one another slightly: thumb, index, middle, ring, pinky).
  The `ok` pose uses a small coordinate-descent solve so thumb and index tips meet.
- **Render:** Cycles, CPU, 40 samples with adaptive sampling + OpenImageDenoise, transparent film, "Standard" view
  transform, orthographic camera (same camera and scale for every frame), 384x384 px then downsampled (premultiplied
  Lanczos) to 192 px. Lighting: soft key (upper left front), fill (right front), two rim lights, dim ambient world.
  Material `SageClay`: single Principled BSDF based on brand sage `#436c57`, roughness 0.52, light sheen.

## Handedness (please read)

This is a left hand. In the rest pose fingers point up, the **palm faces the camera** and the **thumb is on the
viewer's left**. That is what a left palm looks like: hold your own left palm up to your face and the thumb is on
your left; the left hand only makes a correct "L" (thumb on the right) when you look at the **back** of it.
A palm-view hand with the thumb on the viewer's right is a right hand. Mirroring these images would therefore turn the
asset into a right hand.

Side facing the camera per pose: hub, wave, peace, three, fist = palm; ok = palm turned about 45 degrees so the thumb
edge comes forward and the ring reads; thumbsUp, pointRight = palm side (curled fingers visible), forearm on the left,
thumb on top; pointDown = palm side, hand upside-down (thumb on viewer's right, as it must be for an inverted left hand);
palm = palm up and tilted towards the viewer, fingers to the right, thumb on the far side.

## Outputs

| File | What |
| --- | --- |
| `hand.blend` | editable scene (mesh, modifiers, rig, 10 actions, camera, lights, material) |
| `../../public/hand/sheet.webp` | 1728x1728 RGBA sprite sheet, 9 columns x 9 rows of 192 px cells |
| `../../public/hand/poster-<pose>.webp` | 192x192 RGBA final frame of each pose |
| `../../public/hand/contact-sheet.png` | labelled review sheet (hub + nine poses, 384 px, on `#faf8f3`) |

Sprite sheet layout: rows top to bottom = `wave, thumbsUp, ok, pointRight, pointDown, peace, three, palm, fist`;
column 0 = hub, column 8 = final pose. Cell (row r, col c) is at `x = c*192, y = r*192`. Play A -> hub -> B by running
A's row backwards then B's row forwards.

## Rebuild

    pip install bpy pillow numpy
    python3 build_hand.py                      # everything, about 8-9 min on 4 CPU cores
    python3 build_hand.py --preview ok,fist    # quick look at final poses (PNG to the scratch dir)
    python3 build_hand.py --views              # rest-pose turnaround

Intermediate PNG frames go to `$HAND_SCRATCH` (falls back to `./_build`).

## Known limitations

- Stylised mannequin, not a sculpt: no nails, creases, tendons or skin detail; the wrist stub is a simple rounded block;
  the palm is fairly flat in profile; the finger pads give the straight fingers a slightly segmented look.
- In curled poses (fist, thumbsUp, point*, peace, three) fingers and thumb interpenetrate each other and the palm
  a little, as there is no collision; it is hidden by the single material but visible if you orbit in the `.blend`.
- The thumb in peace/three/fist lies straight across the fingers; it does not wrap around them.
- `ok` is shown three-quarter so the ring is visible; it is the least legible pose at 40-48 px.
- The fist is small in its cell because every pose shares one camera scale (set by the tallest pose).
- In-between frames are plain eased bone interpolation; a small root nudge keeps every frame at least 8% inside
  its cell, so the hand drifts a few pixels during the 90/180 degree turns.
- `sheet.webp` is lossy (quality 80): the nine hub cells come from one identical render but are not bit-identical
  after encoding (mean difference under 0.5/255).
- Cycles denoising at 40 samples is not bit-reproducible between runs/machines.
