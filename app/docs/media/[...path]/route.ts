import { NextResponse } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';

const DOCS_ROOT = path.join(process.cwd(), 'docs');

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  const isSafe =
    segments?.length > 0 &&
    segments.every(
      (segment) =>
        segment &&
        segment !== '.' &&
        segment !== '..' &&
        !segment.startsWith('.') &&
        !segment.includes('\\') &&
        !segment.includes('/')
    );
  if (!isSafe) {
    return new NextResponse('Not found', { status: 404 });
  }

  const abs = path.resolve(DOCS_ROOT, ...segments);
  if (!abs.startsWith(DOCS_ROOT + path.sep)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const mime = MIME[path.extname(abs).toLowerCase()];
  if (!mime) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const s = await stat(abs);
    if (!s.isFile()) {
      return new NextResponse('Not found', { status: 404 });
    }
    const data = await readFile(abs);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
