# BioShip

A USABO-scope biology study game set in a 3D ocean world (three.js): sail a continuous voyage through 30 islands in 10 seas, answering questions to defeat each island's guardian and open its treasure chest on the beach. Drag to look around; tap the water, ship, monster or island to interact.

- A story-true foe on every island and a boss for every sea: Humbaba from Gilgamesh, the Minotaur, Medusa, Grendel, the Oni of Onigashima, the Gumiho, the Nian, the Jade Emperor's heavenly host, Polyphemus, Talos, Kumbhakarna and more
- Your attack comes from the myth of the place: Mjölnir, Excalibur, the Ruyi Jingu Bang, Zeus's thunderbolt, the Eye of Ra, Māui's fishhook and others
- A different chest design for every island; coins and gems spill out when it opens
- Loot: one, two or three stars on a stop claims its Common, Rare and Legendary piece (120 to collect)
- Easy / Medium / Hard difficulty; Normal, Hardcore and Ranked modes; full progress reset
- 1v1 duels with a game code, and a ranked fastest-finish leaderboard (online through Firebase once `firebase-config.js` is filled in; see PACKAGING.md)
- 1,225 original questions at USABO/AP Biology level, dealt from per-topic shuffled decks so they don't repeat, with answer lengths balanced so the longest option isn't a giveaway

**Play:** https://rj2020bro.github.io/bioship/

## Install / stores
Install on Chromebook, phone or desktop from the Play link (Chrome: install icon in the address bar). App Store, Google Play and Steam packaging: see [PACKAGING.md](PACKAGING.md).

## Layout
- `index.html`: current game (build 8, 3D)
- `versions/redesign/`: redesign v1 to v7
- `versions/original/`: original game, bug-fixed and rebalanced copies

Each file is a single self-contained HTML page (three.js r149, MIT, is inlined). Open it in a browser to play.

## Credits
Concept, game design, and all 1,225 questions: Ryan Jian. Code written with Claude Code (Anthropic) under my direction; commits pushed by Claude Code appear under the "claude" account.
