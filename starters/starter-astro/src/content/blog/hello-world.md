---
title: Hello, world
description: The first post on this site, written in Markdown.
pubDate: 2026-11-01
---

This post lives in `src/content/blog/hello-world.md`. Every Markdown file in that folder becomes a page under `/blog/`.

The frontmatter at the top is checked against the schema in `src/content.config.ts`, so a missing title or a bad date fails the build instead of shipping a broken page.
