import { marked } from 'marked';
import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';
import https from 'https';

const CONTENT_DIR = 'content';
const TEMPLATES_DIR = 'templates';
const STATIC_DIR = 'static';
const DIST_DIR = 'dist';
const GITHUB_USERNAME = 'notsaad';

async function clean() {
  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await fs.mkdir(DIST_DIR, { recursive: true });
}

async function fetchGitHubChart() {
  const url = `https://ghchart.rshah.org/${GITHUB_USERNAME}`;
  const outputPath = path.join(STATIC_DIR, 'assets', 'github-chart.svg');

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        console.warn(`Failed to fetch GitHub chart: ${response.statusCode}`);
        resolve(); // Don't fail the build if this fails
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', async () => {
        try {
          const svgData = Buffer.concat(chunks);
          await fs.mkdir(path.dirname(outputPath), { recursive: true });
          await fs.writeFile(outputPath, svgData);
          console.log('Fetched latest GitHub chart');
          resolve();
        } catch (err) {
          console.warn('Failed to save GitHub chart:', err.message);
          resolve(); // Don't fail the build
        }
      });
    }).on('error', (err) => {
      console.warn('Failed to fetch GitHub chart:', err.message);
      resolve(); // Don't fail the build
    });
  });
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function getMarkdownFiles(dir) {
  const files = [];

  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  await scan(dir);
  return files;
}

async function buildPage(filePath, template) {
  const raw = await fs.readFile(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);
  const html = marked.parse(content);

  const title = frontmatter.title || 'Saad Mazhar';
  const description = frontmatter.description || '';

  const output = template
    .replace(/\{\{title\}\}/g, title)
    .replace(/\{\{description\}\}/g, description)
    .replace(/\{\{content\}\}/g, html);

  // Determine output path
  const relativePath = path.relative(CONTENT_DIR, filePath);
  let outputPath;

  if (relativePath === 'index.md') {
    outputPath = path.join(DIST_DIR, 'index.html');
  } else {
    // For other files, create directory structure
    const dir = path.dirname(relativePath);
    const name = path.basename(relativePath, '.md');
    outputPath = path.join(DIST_DIR, dir, name, 'index.html');
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, output);

  console.log(`Built: ${outputPath}`);
}

async function build() {
  console.log('Building site...\n');

  // Clean and create dist directory
  await clean();

  // Fetch latest GitHub chart
  await fetchGitHubChart();

  // Read template
  const template = await fs.readFile(
    path.join(TEMPLATES_DIR, 'base.html'),
    'utf-8'
  );

  // Process all markdown files
  const markdownFiles = await getMarkdownFiles(CONTENT_DIR);

  for (const file of markdownFiles) {
    await buildPage(file, template);
  }

  // Copy static assets
  try {
    await copyDir(STATIC_DIR, DIST_DIR);
    console.log('\nCopied static assets');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  console.log('\nBuild complete!');
}

async function watch() {
  const chokidar = await import('chokidar');

  console.log('Watching for changes...\n');

  const watcher = chokidar.default.watch([CONTENT_DIR, TEMPLATES_DIR, STATIC_DIR], {
    ignoreInitial: true,
  });

  watcher.on('all', async (event, filePath) => {
    console.log(`\n${event}: ${filePath}`);
    await build();
  });

  // Initial build
  await build();
}

// Main
const args = process.argv.slice(2);

if (args.includes('--watch')) {
  watch();
} else {
  build();
}
