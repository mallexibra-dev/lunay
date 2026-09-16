export type DocsNavItem = {
  title: string;
  slug: string[];
  order: number;
};

export type DocsNavSection = {
  title: string;
  slug: string;
  order: number;
  items: DocsNavItem[];
};

export type DocsPageLink = {
  title: string;
  href: string;
};

export type DocsPageData = {
  title: string;
  description?: string;
  content: string;
  mediaBase: string;
  prev: DocsPageLink | null;
  next: DocsPageLink | null;
};
