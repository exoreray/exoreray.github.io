# Private relationship essay

Standalone static page: `public/under-the-same-stars-9ec6/`.
Production URL: `https://exoreray.github.io/under-the-same-stars-9ec6/`.
It is deliberately absent from the site's home navigation and requests no search indexing.

The complete supplied text lives only in Ray's private local writing directory,
`PersonalOps/02_Writing/starletter-2026-10-11/letter.txt`.
The published payload is AES-256-GCM ciphertext, derived using PBKDF2-SHA256
with 600,000 iterations and randomly generated salt and nonce. The password
is not stored in the site, repository, localStorage, cookies or URL. The browser
decrypts the letter in memory; closing the letter removes the rendered text.
As with any client-side encrypted document, password strength determines its
resistance to offline guessing. Decryption is not server authentication.

To edit: change the private letter, then run `seal.mjs <private-source> <destination>`
with the password on stdin. The sealer checks that every paragraph and sentence
preserves the complete supplied text. Never commit the private plaintext.

`compose.py <wav-output>` creates the original 64 BPM minimal piano/ambient instrumental
from synthesized notes; no third-party song or sampled recording is used.
Convert the WAV to `same-sky.mp3` with ffmpeg at 128 kbps.
The interface uses the device's modern system font. The page uses a plain black background and white subtitles, with no
decorative title or external runtime dependencies.

Preview with a local HTTP server. Verify wrong/correct password, text checksum,
single-sentence subtitle playback, pause frame, user-scroll exit, music, volume, chapter links, dialogs,
keyboard focus, 320 px / 390 px / desktop layouts and reduced-motion preferences.

For this isolated addition, source is committed to master and the same page
directory is added to the existing gh-pages tree. Verify that the publish diff
changes only this directory. Never rebuild and publish unrelated local portfolio
work. Normal future portfolio builds include the page through public/.
