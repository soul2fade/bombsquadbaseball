# EAS Build + Expo Go Setup

Two device paths: **Expo Go** for fast JS iteration and **EAS Build** for
real binaries that survive native module changes and ship to TestFlight /
Play Internal Testing.

## One-time setup (local machine)

```bash
# 1. Install the EAS CLI globally
npm install -g eas-cli

# 2. Create / sign in to your Expo account (browser flow)
eas login

# 3. Link this project to your Expo account.
#    Writes extra.eas.projectId into app.json.
eas init
git add app.json && git commit -m "Link EAS project"
```

## Expo Go (fastest preview, JS-only)

Use this for day-to-day UI / logic work. No build required.

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app from the App Store / Play Store.

**Caveats**
- Must be the SDK-54-compatible Expo Go (latest store version as of late 2025+).
  Older Expo Go silently fails to load SDK 54 — looks like a splash hang.
- Native modules added later (e.g. anything you `npx expo install` that
  isn't already in Expo Go) require a dev client build (next section).

## EAS dev client (Expo Go replacement with your native modules)

One-time install on your device, then iterate like Expo Go.

```bash
# iOS simulator (Mac only)
npm run build:dev:ios

# Physical iOS device — needs an Apple Developer account ($99/yr)
eas build --profile development --platform ios

# Android (physical device or emulator)
npm run build:dev:android
```

Install the resulting `.app` / `.apk` from the EAS build page link, then:

```bash
npx expo start --dev-client
```

## Preview builds (share with testers)

Internal-distribution build — installable via a link, no app store needed.

```bash
npm run build:preview:ios       # produces .ipa for ad-hoc / TestFlight
npm run build:preview:android   # produces .apk
```

iOS internal distribution requires a paid Apple Developer account.
Android `.apk` installs directly — no Google Play account required for
internal testing.

## Production builds

```bash
eas build --profile production --platform all
eas submit --profile production --platform all
```

`eas.json` is already configured for `appVersionSource: "remote"` so version
codes auto-increment server-side.

## CI builds (.github/workflows/eas-build.yml)

A workflow_dispatch action is wired up: go to **Actions → EAS Build → Run
workflow**, pick a profile and platform. To use it once:

1. In Expo dashboard → Account settings → Access tokens, create a token.
2. In GitHub repo → Settings → Secrets → Actions, add `EXPO_TOKEN` = that token.

After that, every manual run kicks off an EAS build without you having to
have the CLI installed locally.
