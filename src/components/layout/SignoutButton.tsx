"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SignoutButton() {
  const router = useRouter();
  async function handleSignout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          authClient.getSession();
          router.refresh();
        },
      },
    });
    // Optionally redirect
    // redirect('/signin');
  }
  return <Button onClick={handleSignout}>Se deconnecter</Button>;
}
