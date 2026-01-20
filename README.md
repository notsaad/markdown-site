# markdown-site

A lightweight static site generator that transforms Markdown files into a personal portfolio website.

## What's Included

- **Markdown-based content** with YAML front matter for metadata
- **Custom HTML template** system with variable substitution
- **Dark theme** with JetBrains Mono font
- **Responsive design** (two-column grid on desktop, single column on mobile)
- **File watcher** for development with automatic rebuilds

### Tech Stack

- Node.js with ES modules
- [marked](https://github.com/markedjs/marked) for Markdown parsing
- [gray-matter](https://github.com/jonschlinkert/gray-matter) for front matter
- [chokidar](https://github.com/paulmillr/chokidar) for file watching

## Project Structure

```
content/       # Markdown source files
templates/     # HTML templates
static/        # CSS, fonts, and assets
dist/          # Generated output
build.js       # Build script
```

## Getting Started

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run dev

# In another terminal, serve the site
npm run serve

# Or just build once
npm run build
```

The site will be available at `http://localhost:3000` when using `npm run serve`.
