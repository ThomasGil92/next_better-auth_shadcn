import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "lucide-react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import UserName from "./components/UserName";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect("/signin");
  }

  const user = session.user as User;

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 py-8'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle>
                Welcome back, <UserName name={user.name || "User"} /> !
              </CardTitle>
              <CardDescription>
                Here&apos;s your dashboard overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Email
                  </p>
                  <p className='text-sm'>{user.email || "No email provided"}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Account ID
                  </p>
                  <p className='font-mono text-sm'>{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>Your Activity</CardTitle>
              <CardDescription>Recent account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8'>
                <p className='text-muted-foreground'>No recent activity</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
