# ENI Mobile

Personal Android client for OpenCode.

Built for **one operator**. Red-team oriented. Small font. Dark. Fast tool approvals. Local secrets only. No telemetry.

Repo: `anchosauve-ops/cuddly-giggle`

## What this is

- Dense small-font UI (10–13 px) for long sessions
- Biometric lock
- Hardened OpenCode client (multiple endpoint shapes)
- Big thumb-zone Approve / Deny permission bar + haptics
- Local notes per session (findings stay on device)
- One-tap wipe of local cache
- Auto health + session refresh
- Low-glare dark theme

## Run it (no laptop needed)

### Option 1 – GitHub Codespaces (easiest)

1. Open this repo on GitHub
2. Click the green **Code** button → **Codespaces** → Create codespace on `main`
3. Once the terminal appears:

```bash
npm install
npx expo start
```

4. On your Android phone install **Expo Go** from Play Store  
5. Scan the QR code that appears in the Codespace terminal

### Option 2 – Local / any machine

```bash
git clone https://github.com/anchosauve-ops/cuddly-giggle.git
cd cuddly-giggle
npm install
npx expo start
```

Then scan with Expo Go.

## First use

1. App opens → biometric (or turn off in Settings)
2. Tap **+ Conn** and paste your OpenCode server URL + credentials
3. Sessions appear → open one → prompt → approve tools with your thumb
4. Use **note** for findings, **wipe** when finished

## Stack

Expo SDK 52 · React Native · Expo Router · Zustand · Axios · expo-secure-store

## Still coming

- Real SSE streaming
- Full terminal
- File tree + @-mention
- Diff viewer
- Voice loop

This is yours.
