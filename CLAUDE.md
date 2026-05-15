# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chinese personal blog built with VitePress and the `@sugarat/theme` blog theme. All content is in Chinese (zh-cn). The site is deployed to GitHub Pages and a remote server via GitHub Actions.

## Development Commands

```bash
pnpm dev          # Start VitePress dev server
pnpm build        # Production build
pnpm serve        # Preview production build locally
```

No test, lint, or format scripts are configured.

## Architecture

**Stack:** VitePress + Vue 3 + `@sugarat/theme` (blog theme) + Element Plus + SCSS

**Content root:** `docs/` (VitePress file-system routing — each `.md` file becomes a page)

### Key Configuration Files

- `docs/.vitepress/config.mts` — Main VitePress config (uses `defineConfig` from `@sugarat/theme/node`, NOT default VitePress). Contains nav bar, search plugin, markdown plugins, analytics.
- `docs/.vitepress/blog-theme.ts` — Blog theme config via `getThemeConfig`. Controls RSS, Giscus comments, footer, popover, theme color.
- `docs/.vitepress/theme/index.ts` — Custom theme entry that extends `@sugarat/theme` with custom CSS and Google Analytics.
- `docs/.vitepress/theme/style.scss` — Custom SCSS overrides (backgrounds, navbar, blog cards, timeline).
- `docs/.vitepress/theme/green-theme.var.css` — Green color scheme CSS variable overrides.

### Content Structure

| Directory | Content |
|-----------|---------|
| `full-stack/` | Front-end, Java, Rust, database, other tech |
| `computer-basics/` | Networking, OS, data structures |
| `training/` | Tutorials — AI, Linux, software tools |
| `interview/` | Interview prep (daily questions, skills) |
| `notes/` | Personal notes (tech weekly, reading, life) |
| `about/` | About page |
| `friend-link-list/` | Friend links (uses VPTeamMembers) |

### Search

Uses `vitepress-plugin-pagefind` with Chinese optimization. The theme's built-in search is disabled (`search: false` in blog-theme.ts).

## Content Conventions

- **Frontmatter:** Articles use YAML frontmatter for metadata. Homepage uses `layout: home` with blog-specific fields (name, motto, inspiring quotes, pageSize, author, logo).
- **Hidden pages:** Use `hidden: true` in frontmatter to exclude from blog listings.
- **Markdown extensions available:** KaTeX math (`$...$` / `$$...$$`), timeline components (`vitepress-markdown-timeline`), subscript (`~sub~`), superscript (`^sup^`), mark/highlight (`==text==`).

## Deployment

CI/CD via `.github/workflows/main.yml`: triggers on push/PR to `master`, runs `pnpm install` + `pnpm run build`, then deploys to:
1. GitHub Pages repo (`i-mufeng/i-mufeng.github.io`)
2. Remote server via SSH
