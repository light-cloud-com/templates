---
title: Deploying to Light Cloud
description: How this site goes from a git push to static files on a CDN.
date: 2026-11-05
---

Push to your repository and Light Cloud runs `npm run build`. Eleventy writes every page to `_site/`, and that folder is what gets served.

## Adding a post

1. Create a Markdown file in `src/posts/`.
2. Give it a `title` and a `date`.
3. Push. The post appears on the home page, newest first.
