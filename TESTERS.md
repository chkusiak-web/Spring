# Trying the Spring beta

Download the file for your computer from the latest release:

- **Mac with Apple Silicon (M1 and newer):** `Spring-…-mac-arm64.dmg`
- **Intel Mac:** `Spring-…-mac-x64.dmg`
- **Windows:** `Spring-…-win-x64.exe`

## Mac
1. Open the `.dmg` and drag Spring into Applications.
2. The beta isn't signed by Apple yet, so macOS blocks the first launch ("Apple could not verify…"). Click **Done**, then open
   **System Settings › Privacy & Security**, scroll down, click **Open Anyway** next to Spring, and confirm. You only do this once.
   If there's no Open Anyway button, run this in Terminal: `xattr -dr com.apple.quarantine /Applications/Spring.app`

## Windows
1. Run the `.exe`. If Windows shows "Windows protected your PC", click **More info › Run anyway**.

## AI conversations (optional)
Spring works without AI. To let characters improvise and check your grammar, open **Settings › AI model › Download**.
It's a one-time download of about 5.7 GB and runs entirely on your computer; nothing goes online.
16 GB of memory is recommended.

## Chinese voice
- **Mac:** System Settings › Accessibility › Spoken Content › System voice › Manage Voices › Chinese (China mainland).
- **Windows:** Settings › Time & language › Language & region › Add a language › Chinese (Simplified, China), with Text-to-speech ticked.
