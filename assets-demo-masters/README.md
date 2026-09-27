# Demo video/gif masters

Original `final_*.gif` screen recordings. These are the real masters and are
intentionally kept out of the deployed output.

Project pages render their demo from the `.mp4` + `.webm` pair in
`src/assets/images/projects/<project>/`, which shares a basename with these
files. `final_<name>.png` in the same directory is the still that doubles as the
video poster.

Re-encode here if a demo needs rebuilding, for example:

```sh
ffmpeg -i assets-demo-masters/projects/final_<name>.gif \
  -movflags +faststart -pix_fmt yuv420p src/assets/images/projects/<project>/final_<name>.mp4
```

Extract or refresh a poster still from an existing recording:

```sh
ffmpeg -ss 2 -i src/assets/images/projects/<project>/final_<name>.mp4 \
  -frames:v 1 src/assets/images/projects/<project>/final_<name>.png
```

Project pages reference the `.mp4` / `.webm` pair and the `final_<name>.png`
still. No content entry references a GIF, and no `final_*.gif` files belong in
`src/assets/`: a stub GIF there renders as an 8x8 figure in the Final Product
section.
