---
title: Deploying to Light Cloud
description: How this site goes from a git push to static files on a CDN.
pubDate: 2026-11-05
---

Push to your repository and Light Cloud runs `npm run build`. Astro renders every page to HTML in `dist/`, and that folder is what gets served.

## Adding a post

1. Create a Markdown file in `src/content/blog/`.
2. Give it a `title`, `description` and `pubDate`.
3. Push. The post appears on the blog index, newest first.

Set `draft: true` to keep a post out of the build while you work on it.
