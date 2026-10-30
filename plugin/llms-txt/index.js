/**
 * Generates /llms.txt and /llms-full.txt after the site is built.
 *
 * - llms.txt: a hand-written header (header.md) followed by a link index generated from the docs
 *   tree (titles, descriptions and permalinks come from Docusaurus itself, so they cannot drift).
 * - llms-full.txt: the same header followed by the full text of every doc.
 * Release notes are left out of both. See https://llmstxt.org for the format.
 */
const fs = require('fs');
const path = require('path');

const EXCLUDED = [/^docs\/release-notes\//];

function stripFrontMatter(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function shorten(text) {
  const flat = (text || '').replace(/\s+/g, ' ').trim();
  const sentence = flat.match(/^.*?[.!?](\s|$)/);
  const out = (sentence ? sentence[0] : flat).trim();
  return out.length > 180 ? out.slice(0, 177).trimEnd() + '...' : out;
}

function sourcePath(doc, siteDir) {
  return path.join(siteDir, doc.source.replace('@site/', ''));
}

module.exports = function llmsTxtPlugin(context) {
  return {
    name: 'llms-txt',
    async postBuild({siteDir, outDir, siteConfig, plugins}) {
      // The files describe the default (English) docs only.
      if (context.i18n.currentLocale !== context.i18n.defaultLocale) return;
      const docsPlugin = plugins.find((p) => p.name === 'docusaurus-plugin-content-docs');
      const docs = docsPlugin.content.loadedVersions[0].docs
        .filter((d) => !EXCLUDED.some((re) => re.test(d.source.replace('@site/', ''))))
        .map((d) => ({...d, file: sourcePath(d, siteDir)}));

      // Order sections like the sidebar: category position, then doc position, then title.
      const categoryOf = (d) => path.dirname(d.source.replace('@site/docs/', ''));
      const categoryInfo = {};
      for (const d of docs) {
        const dir = categoryOf(d);
        if (categoryInfo[dir]) continue;
        const catFile = path.join(siteDir, 'docs', dir, '_category_.json');
        categoryInfo[dir] = fs.existsSync(catFile)
          ? JSON.parse(fs.readFileSync(catFile, 'utf8'))
          : {label: dir, position: 999};
      }
      docs.sort((a, b) =>
        (categoryInfo[categoryOf(a)].position ?? 999) - (categoryInfo[categoryOf(b)].position ?? 999) ||
        categoryOf(a).localeCompare(categoryOf(b)) ||
        (a.frontMatter.sidebar_position ?? 999) - (b.frontMatter.sidebar_position ?? 999) ||
        a.title.localeCompare(b.title));

      const header = fs.readFileSync(path.join(__dirname, 'header.md'), 'utf8').trimEnd();
      const base = siteConfig.url.replace(/\/$/, '');

      let index = header + '\n';
      let lastDir = null;
      for (const d of docs) {
        const dir = categoryOf(d);
        if (dir !== lastDir) {
          index += `\n## ${categoryInfo[dir].label}\n\n`;
          lastDir = dir;
        }
        // Docusaurus fills in a description from the page body; very short ones (e.g. "Introduction") are noise.
        const desc = d.description && d.description.trim().length >= 30 ? shorten(d.description) : '';
        index += `- [${d.title}](${base}${d.permalink})${desc ? ': ' + desc : ''}\n`;
      }
      fs.writeFileSync(path.join(outDir, 'llms.txt'), index);

      let full = header + '\n';
      for (const d of docs) {
        full += `\n\n---\n\n<!-- ${base}${d.permalink} -->\n\n${stripFrontMatter(fs.readFileSync(d.file, 'utf8')).trim()}\n`;
      }
      fs.writeFileSync(path.join(outDir, 'llms-full.txt'), full);
      console.log(`llms-txt: wrote llms.txt (${docs.length} docs) and llms-full.txt (${(full.length / 1024).toFixed(0)} KB)`);
    },
  };
};
