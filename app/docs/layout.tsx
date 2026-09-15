import { getDocsNav } from '@/lib/docs/queries';
import { DocsShell } from './_components/docs-shell';

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const sections = getDocsNav();
  return <DocsShell sections={sections}>{children}</DocsShell>;
}
