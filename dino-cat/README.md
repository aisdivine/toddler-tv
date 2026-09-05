# Adventures with Dino and Caterpillar

A toddler show built from Divine's kid's real toys (the orange inflatable bounce
dinosaur and the green wooden pull-along caterpillar).

Pipeline is a small subset of the Deuce Studio OpenRouter lane
(`../../deuce-studio/lib/openrouter.mjs`) — same key, same cost discipline.

    show.mjs     show spec: style, both character sheets, set, 8 shots
    cast.mjs     toy photos -> clean character sheets   (Nano Banana, $0.039 ea)
    stills.mjs   character sheets -> 8 shot stills      (Nano Banana, $0.039 ea)
    clips.mjs    each still -> 8s clip with dialogue    (Veo 3.1 Lite, $0.40 ea)
    gate.mjs     freeze / black-frame / silent-audio gate — run BEFORE showing Divine
    ledger.mjs   every paid call appends to cost.json

## Run

    set -a && source ../../deuce-studio/.env && set +a
    node cast.mjs
    node stills.mjs            # skips shots that already exist
    node stills.mjs s2 s7      # force-reroll named shots
    node clips.mjs             # skips clips that already exist
    SEED=8811 node clips.mjs s2
    node gate.mjs clips/*.mp4 "out/Adventures with Dino and Caterpillar - Ep1.mp4"

Assemble:

    printf "file '%s/clips/s%d.mp4'\n" $PWD 1 $PWD 2 ... > out/list.txt
    ffmpeg -y -f concat -safe 0 -i out/list.txt -c:v libx264 -crf 20 \
      -pix_fmt yuv420p -c:a aac -b:a 192k "out/Adventures with Dino and Caterpillar - Ep1.mp4"

## Episode 1 — 64s, 8 shots

1. Dino bounces off the porch — "Good morning, Caterpillar!"
2. Caterpillar rolls up the path — "Where are we going today?"
3. They follow a yellow leaf down the sidewalk
4. A puddle blocks the way — "Hop on my back!"
5. Dino splashes through with Caterpillar riding
6. They say hello to a ladybug on the mailbox
7. Golden hour — Caterpillar counts flowers
8. Goodbye at the porch — "See you tomorrow!"

## Notes / gotchas

- Veo 3.1 Lite takes only 4/6/8s, 720p, and accepts NO input_references —
  identity travels through the first frame only. So the still has to be right.
- Veo drifted the caterpillar to MAGENTA with spring antennae on the first s2
  roll (kept as `clips/s2_bad_magenta.mp4`). Fixed by adding an explicit
  COLOUR LOCK clause to the clip prompt and re-rolling on a new seed.
  The colour lock is now in every clip prompt.
- Nano Banana repeated the same porch composition for s2 and s8; fixed by
  rewriting s2's still prompt to be caterpillar-forward with no house facade.
