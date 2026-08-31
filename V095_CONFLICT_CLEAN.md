# Backstage v0.9.5 — Merge Conflict Cleanup

Vercel reported unresolved Git merge markers inside Portal components.

This clean build contains no `<<<<<<<`, `=======`, or `>>>>>>>` merge markers
in project source files.

The overwrite pack includes the complete Portal component folder plus the
Portal type/demo files and the two previously failing wedding components.

Important: replace the GitHub files wholesale. Do not use GitHub's conflict
merge editor to combine both versions.
