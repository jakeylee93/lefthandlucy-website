# Left Hand Lucy — line-ink hand signature

A fine-line editorial ink drawing of one **left** hand in nine gestures, animated between
gestures as a sprite sheet. It replaces the earlier Blender "sage clay" hand (retired on
Jake's feedback, 13 Nov 2026: too green, too claymation; still in git history).

## Provenance

- **Stills** (`stills/*.webp`, 1024 px): generated in OpenArt with Nano Banana 2.1 (image to image)
  from one style sheet, one drawing per gesture plus `hub` (relaxed open hand). Checked by eye:
  every drawing is a left hand with five fingers.
- **Movement** (`clips/*.mp4`, 2 s, 960 px): OpenArt Wan 2.7 image to video, start frame = `hub`,
  end frame = the gesture still.
- No stock, scanned or third-party artwork. No photograph of a real person.

## Handedness

Palm towards the viewer, thumb on the viewer's **left**: that is a left hand. Do not mirror the images.

## Rebuild

```bash
cd assets-src/hand
for p in wave thumbsUp ok pointRight pointDown peace three palm fist; do python3 frames.py clips/$p.mp4 fr/$p stills/$p.webp; done
python3 build.py ../../public/hand
```

`frames.py` picks nine frames per clip at even steps of the movement. `build.py` turns ink darkness
into opacity (transparent background, site ink colour `#273d35`), thickens the line slightly so it
holds at 48 px, crops every frame to one shared box and writes:

- `sheet.webp`: 9 × 9 grid, 144 px cells. Rows in `HAND_POSES` order (wave, thumbsUp, ok, pointRight,
  pointDown, peace, three, palm, fist); column 0 = the shared open hand, column 8 = the gesture.
- `poster-<pose>.webp`: the still shown before the sheet has loaded.
- `contact-sheet.png`: the whole sheet on cream, for review.

`app/hand.tsx` plays a row backwards to the open hand, then the new row forwards. On the dark
contact chapter the lines are turned cream with a CSS filter (`.site-header.on-dark .hand-sprite`).
