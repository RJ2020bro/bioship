# Shipping BioShip: web, Chromebook, iOS, Android, Steam

All store builds wrap the same game file, `index.html`. `npm run build` copies it to `www/` and adds the PWA tags there, so `index.html` itself is never edited by packaging.

| Target | Tool | Command |
|---|---|---|
| Web + Chromebook (installable PWA, works offline) | manifest + service worker, GitHub Pages | push to `main` (workflow `pages.yml`) |
| iOS (App Store) | Capacitor 8 | `npm run ios` |
| Android (Google Play, also installs on Chromebooks) | Capacitor 8 | `npm run android` |
| Steam (Windows / macOS / Linux) | Electron + optional steamworks.js | `npm run dist:steam` |

## ⚠️ Online features need a real backend first

1v1 duels and the ranked leaderboard use `window.claude` (Claude artifact storage and rooms). That API only exists inside the Claude artifact page. On GitHub Pages, the App Store, Play Store and Steam it is missing, so those modes will not work. Single-player and local saves work everywhere.

Before submitting to any store, either hide those modes in store builds (check `window.BIOSHIP_PLATFORM`, which is `web`, `mobile` or `desktop`) or move them to a real backend, for example Firebase (Firestore for the leaderboard, Realtime Database for duel rooms) or Supabase. On Steam, leaderboards and lobbies can also go through Steamworks.

## One-time setup on your computer

1. Install Node 22+.
2. `npm install`
3. iOS: a Mac with Xcode 16+ and CocoaPods (`sudo gem install cocoapods`).
4. Android: Android Studio (includes the SDK and JDK 21).
5. `npm run build && npm run cap:add` creates the `ios/` and `android/` projects. Commit them.
6. `npm run cap:assets` generates every app icon and splash size from `resources/`.

After any change to `index.html`, run `npm run cap:sync` (mobile) or `npm run build` (desktop).

## What you must do yourself (accounts, money, signing)

### Web / Chromebook (free)
- Repo **Settings → Pages → Source: GitHub Actions**. Every push to `main` then deploys `www/` to https://rj2020bro.github.io/bioship/.
- On a Chromebook, open that URL in Chrome and click the install icon in the address bar. It runs fullscreen and offline after the first load.
- Optional: the Android build also installs on Chromebooks from the Play Store.

### Apple App Store ($99 / year)
1. Enroll at https://developer.apple.com/programs/ (individual is fine; a minor needs a parent/guardian to enroll).
2. In Xcode (`npm run ios`): select the App target → Signing & Capabilities → pick your Team. Bundle ID: `com.rj2020bro.bioship` (change it in `capacitor.config.json` if taken, before running `cap:add`).
3. In App Store Connect create the app record with that bundle ID.
4. Xcode → Product → Archive → Distribute App → App Store Connect. Test with TestFlight first.
5. Store listing: privacy policy URL, age rating questionnaire, App Privacy answers (no data collected if online modes are off), screenshots for 6.9" and 6.5" iPhone and 13" iPad, description, keywords, support URL.
6. Apple guideline 4.2 rejects thin web wrappers. BioShip is a full offline game, which helps; mention offline play and haptics in review notes.

### Google Play ($25 once)
1. Register at https://play.google.com/console. New personal accounts must run a closed test with 12+ testers for 14 days before production.
2. In Android Studio (`npm run android`): Build → Generate Signed App Bundle → create an upload keystore. **Back up the `.jks` file and passwords; never commit them** (they're in `.gitignore`). Enroll in Play App Signing.
3. Upload the `.aab`, fill in the content rating, Data safety form, target audience (if under 13 is targeted, Families policy applies), privacy policy URL.
4. Assets: 512×512 icon (`pwa/icons/icon-512.png`), 1024×500 feature graphic, 2–8 phone screenshots, optional Chromebook/tablet screenshots.

### Steam ($100 per game, refundable after $1,000 in sales)
1. Sign up at https://partner.steamgames.com, pay the Steam Direct fee, complete tax and bank forms (30-day wait before the first release).
2. Put your real App ID in `steam/steam_appid.txt` (it ships as `480`, Valve's Spacewar test app, so steamworks works in development). Fill the depot IDs into `steam/*.vdf`.
3. Build on each OS (or run the **Desktop builds** workflow in GitHub Actions and download the artifacts): `npm run dist:steam` → `dist/win-unpacked`, `dist/mac`, `dist/linux-unpacked`.
4. Upload with SteamCMD: `steamcmd +login <builder account> +run_app_build ../steam/app_build.vdf +quit`.
5. Launch option in Steamworks: Windows `BioShip.exe`, macOS `BioShip.app`, Linux `bioship`.
6. Store page assets: header capsule 920×430, small capsule 462×174, main capsule 1232×706, vertical capsule 748×896, library assets (600×900, 3840×1240 hero, logo), 5+ screenshots at 1920×1080, a trailer is strongly recommended. Store page and build both need Valve review (2–5 business days each). The "Coming Soon" page must be live 2 weeks before release.
7. macOS builds outside Steam need an Apple Developer ID to sign/notarize; inside Steam unsigned is OK but Gatekeeper may still warn. Windows code signing is optional for Steam.
8. Achievements: create them in Steamworks, then the game can call `window.bioshipDesktop?.steam.unlock('ACH_ID')`. Nothing calls it yet; that's a small addition to the game later.

### Everyone needs
- A privacy policy URL (a simple page in this repo works).
- Screenshots and a short and long description.
- An age/content rating (all stores).

## Files

- `scripts/build-web.mjs` builds `www/`. `scripts/make-icons.mjs` re-renders icons from `pwa/icons/icon.svg` (needs Playwright).
- `pwa/` manifest, service worker, icons.
- `capacitor.config.json` iOS/Android config.
- `electron/` desktop shell (`main.cjs`), safe bridge (`preload.cjs`), Steam hooks (`steam.cjs`, no-ops without Steam).
- `steam/` App ID and SteamCMD build scripts.
- `resources/` 1024 icon and 2732 splash for Capacitor and Electron.
- `.github/workflows/pages.yml` web deploy, `desktop.yml` desktop builds for Steam.
