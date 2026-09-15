import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type {
  DocsNavItem,
  DocsNavSection,
  DocsPageData,
  DocsPageLink,
} from '@/types/docs';

const DOCS_ROOT = path.join(process.cwd(), 'docs');
const FALLBACK_ORDER = 999;

const toPosix = (value: string) => value.split(path.sep).join('/');

const humanizeFileName = (name: string) =>
  name
    .replace(/\.md$/, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

type DocsFrontmatter = { title?: string; description?: string; order?: number };

const readDocFile = (absPath: string) => {
  const raw = fs.readFileSync(absPath, 'utf-8');
  const { data, content } = matter(raw);
  return { frontmatter: data as DocsFrontmatter, content: content.trim() };
};

const collectMarkdownFiles = (dir: string): string[] => {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectMarkdownFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(fullPath);
  }
  return files;
};

const slugFromFile = (absPath: string) => {
  const rel = toPosix(path.relative(DOCS_ROOT, absPath));
  const segments = rel.replace(/\.md$/, '').split('/');
  const isIndex = segments[segments.length - 1] === 'index';
  // URL halaman index = path foldernya (docs/getting-started/index.md -> /docs/getting-started)
  const urlSlug = isIndex ? segments.slice(0, -1) : segments;
  return { segments, urlSlug, isIndex };
};

export const getDocsNav = (): DocsNavSection[] => {
  if (!fs.existsSync(DOCS_ROOT)) return [];

  const sections: DocsNavSection[] = [];
  for (const entry of fs.readdirSync(DOCS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

    const sectionDir = path.join(DOCS_ROOT, entry.name);
    const sectionTitle = humanizeFileName(entry.name);
    let sectionOrder = FALLBACK_ORDER;
    const items: DocsNavItem[] = [];

    for (const file of collectMarkdownFiles(sectionDir)) {
      const { frontmatter } = readDocFile(file);
      const { segments, urlSlug, isIndex } = slugFromFile(file);

      // index.md level section: urutan section dari frontmatter, judul tetap nama modul
      if (isIndex && segments.length === 2) {
        if (typeof frontmatter.order === 'number')
          sectionOrder = frontmatter.order;
      }

      items.push({
        title:
          frontmatter.title ??
          (isIndex
            ? 'Pengantar'
            : humanizeFileName(segments[segments.length - 1])),
        slug: urlSlug,
        order:
          typeof frontmatter.order === 'number'
            ? frontmatter.order
            : isIndex
              ? 0
              : FALLBACK_ORDER,
      });
    }

    items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    sections.push({
      title: sectionTitle,
      slug: entry.name,
      order: sectionOrder,
      items,
    });
  }

  sections.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return sections;
};

const flattenNavLinks = (sections: DocsNavSection[]): DocsPageLink[] =>
  sections.flatMap((section) =>
    section.items.map((item) => ({
      title: item.title,
      href: `/docs/${item.slug.join('/')}`,
    }))
  );

const isSafeSlug = (slug: string[]) =>
  slug.every(
    (segment) =>
      segment &&
      segment !== '.' &&
      segment !== '..' &&
      !segment.startsWith('.') &&
      !segment.includes('\\') &&
      !segment.includes('/')
  );

const buildPageData = (
  absFile: string,
  sections: DocsNavSection[]
): DocsPageData => {
  const { frontmatter, content } = readDocFile(absFile);
  const { urlSlug } = slugFromFile(absFile);
  const href = urlSlug.length > 0 ? `/docs/${urlSlug.join('/')}` : '/docs';

  const links = flattenNavLinks(sections);
  const currentIndex = links.findIndex((link) => link.href === href);
  const prev = currentIndex > 0 ? links[currentIndex - 1] : null;
  // Halaman landing (/docs) tidak ada di nav: langsung tunjuk halaman pertama
  const next =
    currentIndex >= 0 && currentIndex < links.length - 1
      ? links[currentIndex + 1]
      : currentIndex === -1 && links.length > 0
        ? links[0]
        : null;

  const relDir = toPosix(path.relative(DOCS_ROOT, path.dirname(absFile)));
  const mediaBase = relDir ? `/docs/media/${relDir}` : '/docs/media';

  const lastSegment = urlSlug[urlSlug.length - 1] ?? 'dokumentasi';
  return {
    title: frontmatter.title ?? humanizeFileName(lastSegment),
    description: frontmatter.description,
    content,
    mediaBase,
    prev,
    next,
  };
};

export const getDocsPage = (slug: string[]): DocsPageData | null => {
  if (!isSafeSlug(slug)) return null;
  const sections = getDocsNav();

  // /docs/getting-started -> coba getting-started.md lalu getting-started/index.md
  const candidates =
    slug.length > 0 && slug[slug.length - 1] !== 'index'
      ? [slug, [...slug, 'index']]
      : [slug];
  for (const candidate of candidates) {
    const resolved = path.resolve(DOCS_ROOT, ...candidate);
    if (resolved !== DOCS_ROOT && !resolved.startsWith(DOCS_ROOT + path.sep))
      return null;

    const absFile =
      resolved === DOCS_ROOT
        ? path.join(DOCS_ROOT, 'index.md')
        : resolved.endsWith('.md')
          ? resolved
          : `${resolved}.md`;
    if (!fs.existsSync(absFile) || !fs.statSync(absFile).isFile()) continue;

    return buildPageData(absFile, sections);
  }
  return null;
};
