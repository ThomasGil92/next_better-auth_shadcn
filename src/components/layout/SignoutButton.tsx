"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/axios";

export default function SignoutButton() {
  const router = useRouter();
  async function handleSignout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          clearToken();
          router.refresh();
        },
      },
    });
    // Optionally redirect
    // redirect('/signin');
  }
  return <Button onClick={handleSignout}>Signout</Button>;
}
