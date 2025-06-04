import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function Home() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24">
        <div className="text-center py-20">
          <Card className="w-full max-w-2xl mx-auto">
            <div className="p-6">
              <h1 className="text-4xl font-bold mb-6">Welcome to My App</h1>
              <p className="text-muted-foreground mb-8">
                A modern web application built with Next.js and Prisma
              </p>
              <div className="flex justify-center gap-4">
                {!isAuthenticated ? (
                  <Button asChild>
                    <Link href="/signin">Get Started</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
