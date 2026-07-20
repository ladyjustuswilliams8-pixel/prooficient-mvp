"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700"
    >
      Logout
    </button>
  );
}