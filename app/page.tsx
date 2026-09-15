export default function HomePage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-background'>
      <div className='mx-auto max-w-2xl p-8 text-center'>
        <h1 className='mb-4 text-4xl font-bold'>Next.js Starter Kit</h1>
        <p className='mb-8 text-xl text-muted-foreground'>
          Production-ready Next.js 16 template with modern tooling
        </p>

        <div className='mb-8 grid grid-cols-2 gap-4 md:grid-cols-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>16</div>
            <div className='text-sm text-gray-600'>Next.js</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>✓</div>
            <div className='text-sm text-gray-600'>TypeScript</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>✓</div>
            <div className='text-sm text-gray-600'>Tailwind</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-orange-600'>✓</div>
            <div className='text-sm text-gray-600'>shadcn/ui</div>
          </div>
        </div>

        <div className='space-y-4 text-sm text-gray-600'>
          <p>🗄️ Database with Drizzle ORM</p>
          <p>🔄 State Management with TanStack Query</p>
          <p>🧪 Testing with Vitest & React Testing Library</p>
          <p>📊 Logging with Winston</p>
          <p>🛡️ Security headers and rate limiting</p>
        </div>
      </div>
    </main>
  );
}
