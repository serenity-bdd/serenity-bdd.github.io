/**
 * Generates /llms.txt and /llms-full.txt after the site is built.
 *
 * - llms.txt: a hand-written header (header.md) followed by a link index generated from the docs
 *   tree (titles, descriptions and permalinks come from Docusaurus itself, so they cannot drift).
 * - llms-full.txt: the same header followed by the full text of every doc.
 * - <permalink>.md: every doc as plain markdown next to its page, which llms.txt links to.
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
      // The AI section comes first: an agent reads this file from the top.
      const rank = (d) => (categoryOf(d) === 'ai' ? -1 : categoryInfo[categoryOf(d)].position ?? 999);
      docs.sort((a, b) =>
        rank(a) - rank(b) ||
        categoryOf(a).localeCompare(categoryOf(b)) ||
        (a.frontMatter.sidebar_position ?? 999) - (b.frontMatter.sidebar_position ?? 999) ||
        a.title.localeCompare(b.title));

      const header = fs.readFileSync(path.join(__dirname, 'header.md'), 'utf8').trimEnd();
      const base = siteConfig.url.replace(/\/$/, '');

      // Every doc is also published as plain markdown next to its page (<permalink>.md), which is what the
      // index links to. Links between docs inside those copies are rewritten to absolute .md URLs.
      const mdUrl = (d) => `${base}${d.permalink.replace(/\/$/, '')}.md`;
      const byKey = {};
      for (const d of docs) {
        byKey[d.id] = d;
        byKey[d.id.split('/').pop()] = byKey[d.id.split('/').pop()] || d;
        byKey[path.basename(d.source, path.extname(d.source))] = byKey[path.basename(d.source, path.extname(d.source))] || d;
      }
      const toMarkdown = (d) => {
        const body = stripFrontMatter(fs.readFileSync(d.file, 'utf8')).trim();
        const linked = body.replace(/\]\(([^)\s#:]+)(#[^)\s]*)?\)/g, (m, target, anchor) => {
          const key = target.replace(/^(\.\/|\.\.\/)+/, '').replace(/\.mdx?$/, '');
          const hit = byKey[key] || byKey[key.split('/').pop()];
          return hit ? `](${mdUrl(hit)}${anchor || ''})` : m;
        });
        return `# ${d.title}\n\nSource: ${base}${d.permalink}\n\n` + linked.replace(/^#\s+.*\n+/, '') + '\n';
      };
      let mdCount = 0;
      for (const d of docs) {
        if (d.permalink.endsWith('/')) continue;
        const target = path.join(outDir, d.permalink.replace(/^\//, '') + '.md');
        fs.mkdirSync(path.dirname(target), {recursive: true});
        fs.writeFileSync(target, toMarkdown(d));
        mdCount++;
      }

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
        index += `- [${d.title}](${d.permalink.endsWith('/') ? base + d.permalink : mdUrl(d)})${desc ? ': ' + desc : ''}\n`;
      }
      fs.writeFileSync(path.join(outDir, 'llms.txt'), index);

      let full = header + '\n';
      for (const d of docs) {
        full += `\n\n---\n\n<!-- ${base}${d.permalink} -->\n\n${stripFrontMatter(fs.readFileSync(d.file, 'utf8')).trim()}\n`;
      }
      fs.writeFileSync(path.join(outDir, 'llms-full.txt'), full);
      console.log(`llms-txt: wrote ${mdCount} markdown pages, llms.txt (${docs.length} docs) and llms-full.txt (${(full.length / 1024).toFixed(0)} KB)`);
    },
  };
};
