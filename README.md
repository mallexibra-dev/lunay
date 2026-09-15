# Next.js Starter Kit

A comprehensive, production-ready Next.js 16 starter kit with all the modern tools and best practices you need to build scalable web applications.

## 🚀 Features

### ✅ Core Setup

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **ESLint** and **Prettier** for code quality

### 🔐 Authentication

- **Better Auth** for modern authentication
- Email/Password authentication
- Social login (Google, GitHub) support
- Session management
- Protected routes and API endpoints

### 🗄️ Database

- **Drizzle ORM** with PostgreSQL
- Type-safe database operations
- Database migrations and seeding
- Example schemas for users, posts, and categories

### 📝 Forms & Validation

- **React Hook Form** for form management
- **Valibot** for server and client validation
- Custom form hooks and components
- Form validation with real-time feedback

### 🔄 State Management

- **TanStack Query** for server state
- Custom hooks for API calls
- Optimistic updates and caching
- DevTools integration

### 🧪 Testing

- **Vitest** for unit testing
- **React Testing Library** for component testing
- **MSW** for API mocking
- Test utilities and examples

### 📊 Logging

- **Winston** for structured logging
- API request/response logging
- Security event logging
- Performance monitoring

### 🛡️ Security & Proxy

- Request/response proxy layer
- Rate limiting
- CORS handling
- Security headers
- Authentication guards

### 📦 API Design

- Consistent API response format
- Error handling and validation
- Type-safe API clients
- Pagination support

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Protected pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── features/         # Feature components
│   │   └── auth/         # Authentication feature components
│   ├── layouts/          # Layout components
│   └── ui/               # UI components (shadcn/ui)
├── contexts/             # React contexts (empty)
├── db/                   # Database configuration
├── hooks/                # Custom React hooks
│   ├── api/             # API hooks
│   └── use-*.ts         # Various custom hooks
├── lib/                  # Utility libraries
├── styles/               # CSS files
├── test/                 # Test configuration
├── types/                # TypeScript types
├── utils/                # Helper functions
└── validations/          # Form validation schemas
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Bun or npm/yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nextjs-starterkit
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables in `.env.local`:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

   # Authentication
   AUTH_SECRET="your-super-secret-key-here"
   AUTH_URL="http://localhost:3000"

   # OAuth Providers (Optional)
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**

   ```bash
   # Generate database migrations
   bun run db:generate

   # Push schema to database
   bun run db:push

   # Seed database with sample data
   bun run db:seed
   ```

5. **Start the development server**

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Available Scripts

### Development

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

### Code Quality

- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting

### Database

- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:push` - Push schema to database
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:seed` - Seed database with sample data

### Testing

- `bun run test` - Run tests in watch mode
- `bun run test:run` - Run tests once
- `bun run test:ui` - Run tests with UI
- `bun run test:coverage` - Run tests with coverage

## 🔧 Configuration

### Proxy Configuration

The proxy layer handles security, rate limiting, and request/response processing:

1. **Configure Proxy Rules**
   - Customize proxy matching patterns in `src/proxy.ts`
   - Add custom security checks and headers
   - Configure rate limiting thresholds

2. **Authentication Integration**
   - Proxy works with Better Auth for session validation
   - Protected routes are automatically redirected
   - API endpoints can require authentication

### Authentication Setup

1. **Configure Better Auth**
   - Set up your AUTH_SECRET in environment variables
   - Configure OAuth providers (optional)
   - Update trusted origins for production

2. **Custom Auth Flows**
   - Extend auth configuration in `src/lib/auth.ts`
   - Add custom providers or adapters
   - Configure session settings

### Database Setup

1. **Configure Database**
   - Update DATABASE_URL in environment variables
   - Customize schemas in `src/db/schema.ts`
   - Add custom queries in `src/db/utils.ts`

2. **Database Migrations**
   ```bash
   bun run db:generate  # Create migration files
   bun run db:migrate    # Apply migrations
   ```

### API Development

1. **Create API Routes**

   ```typescript
   import { api } from '@/lib/api-handler';

   export const GET = api.get(async (req) => {
     return apiResponse.success(data, 'Success message');
   });

   export const POST = api.post(schema, async (req, data) => {
     return apiResponse.success(result, 'Created successfully');
   });
   ```

2. **Custom API Hooks**
   ```typescript
   export function useCustomData() {
     return useApiQuery(['custom'], '/api/custom');
   }
   ```

## 🧪 Testing

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### API Testing

```typescript
import { describe, it, expect } from 'vitest';
import { validateData } from '@/lib/validation';

test('validates data correctly', async () => {
  const result = await validateData(data, schema);
  expect(result.success).toBe(true);
});
```

## 🎨 Styling

### Tailwind CSS

- Uses Tailwind CSS v4 with inline theme configuration
- Custom CSS variables in `src/styles/variables.css`
- Component variants with class-variance-authority

### Theme Customization

- Modify design tokens in `variables.css`
- Update Tailwind config for custom utilities
- Use shadcn/ui components as base

## 📝 Best Practices

### Code Organization

- Keep components focused and reusable
- Use custom hooks for complex logic
- Separate API calls from UI components
- Maintain consistent file naming

### API Design

- Use consistent response format
- Implement proper error handling
- Add comprehensive logging
- Include request validation

### Performance

- Use TanStack Query for caching
- Implement code splitting
- Optimize images and assets
- Monitor performance metrics

## 🚀 Deployment

### Build for Production

```bash
bun run build
bun run start
```

### Environment Variables

Ensure all required environment variables are set in production:

- DATABASE_URL
- AUTH_SECRET
- OAuth credentials (if using social login)

### Database

- Run migrations in production
- Set up connection pooling
- Configure backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Better Auth](https://better-auth.com/) - Authentication library
- [TanStack Query](https://tanstack.com/query) - Server state management
- [Valibot](https://valibot.dev/) - Schema validation

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.
