# Commentaire audio de la visite 360° / 360° tour audio commentary

Two self-contained narration tracks, one per site language:

| File | Language | Duration | Voice |
| --- | --- | --- | --- |
| `ar.mp3` | arabe / Arabic | ~2 min 19 s | `voice-00` (user-selected) |
| `en.mp3` | anglais / English | ~1 min 40 s | `voice-01` (user-selected) |

`ar.txt` and `en.txt` hold the exact text that was spoken, so the tracks can be
regenerated later. Both tracks describe the eight panoramas in **the same order
as the Pannellum viewer** (`pano1.jpg` → `pano8.jpg`), with one short paragraph
per stop and a spoken stop number. The player divides the real `audio.duration`
by 8 to move the viewer to the matching panorama, and seeks to
`index / 8 * duration` when a visitor picks a stop manually.

The files are served from `/audio/tour/<lang>.mp3` (absolute path, so both
`/visite` and `/visite-360/index.html` reach them). No CDN, no dependency and no
server-side code: if an MP3 is missing or the browser cannot play it, both tours
fall back to the Web Speech API (`speechSynthesis`) with the same Ar/En text.
Audio only starts after a click (browser autoplay policies); the iframe has
`allow="autoplay"`.
