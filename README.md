# Next.js + Prisma + Shadcn UI + Better Auth Template

This is a modern web application template built with Next.js, featuring Prisma ORM for database management, Shadcn UI for beautiful components, and Better Auth for secure authentication.

## Features

- Next.js 15 with Turbopack for improved development experience
- Prisma ORM with Accelerate extension for enhanced performance
- Shadcn UI components for a modern and consistent UI
- Better Auth for secure authentication
- Docker support for consistent development environments
- TypeScript for type safety
- Tailwind CSS for styling
- Modern UI components with animations
- Protected routes and authentication middleware

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure your database connection
   - Set up authentication providers

4. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── /src
│   ├── /app
│   │   ├── /(protected)     # Protected routes
│   │   ├── /signin          # Authentication pages
│   │   └── /layout.tsx      # Root layout
│   ├── /components          # Reusable React components
│   └── /public              # Static assets
├── /prisma                  # Prisma schema and migrations
└── /public                  # Static assets
```

## Prisma Setup

1. Generate Prisma Client:
   ```bash
   pnpm prisma generate
   ```

2. Run migrations:
   ```bash
   pnpm prisma migrate dev
   ```

## Authentication

The application uses Better Auth for handling authentication. Key authentication components:
- `/src/app/signin/SigninForm.tsx` - Sign-in form
- `/src/components/Navbar.tsx` - Navigation with auth state
- `/src/components/SignoutButton.tsx` - Sign-out functionality

## Axios Configuration

The project uses a custom Axios instance configured in [/src/lib/axios.ts](cci:7://file:///Users/totogil/dev_web/next_prisma_shadcn_better-auth_template/src/lib/axios.ts:0:0-0:0) for handling HTTP requests. Key features include:

- **Base URL Configuration**: Automatically sets up the base URL from `NEXT_PUBLIC_API_URL`
- **Authentication**: 
  - Automatic token management using localStorage
  - Request interceptor for adding auth headers
  - Token refresh handling with queue management
- **Security Features**:
  - CSRF protection with `withCredentials: true`
  - Secure token storage
  - Automatic session refresh
- **Error Handling**:
  - Custom error interceptors
  - 401 error handling with token refresh
  - Request queue management for failed requests

The axios instance is configured to work seamlessly with the authentication system, ensuring that all protected API requests are properly authenticated.

## Docker

The application includes Docker support for development and deployment.

```bash
# Start Docker containers (development)
docker-compose up -d

# Stop Docker containers
docker-compose down
```

## Development Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint for code linting

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: Prisma ORM with PostgreSQL
- **UI**: Shadcn UI, Tailwind CSS, Framer Motion
- **Authentication**: Better-Auth
- **Development**: Docker, ESLint, Turbopack

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
