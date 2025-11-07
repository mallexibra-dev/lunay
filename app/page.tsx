export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">Next.js Starter Kit</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Production-ready Next.js 16 template with modern tooling
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">16</div>
            <div className="text-sm text-gray-600">Next.js</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-sm text-gray-600">TypeScript</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">✓</div>
            <div className="text-sm text-gray-600">Tailwind</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">✓</div>
            <div className="text-sm text-gray-600">shadcn/ui</div>
          </div>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          <p>🔐 Authentication with Better Auth</p>
          <p>🗄️ Database with Drizzle ORM</p>
          <p>🔄 State Management with TanStack Query</p>
          <p>🧪 Testing with Vitest & React Testing Library</p>
          <p>📊 Logging with Winston</p>
        </div>
      </div>
    </main>
  )
}