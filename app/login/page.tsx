"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="w-full max-w-md rounded-xl border border-purple-600 bg-zinc-900 p-8">

        <h1 className="text-4xl font-bold text-center text-purple-500 mb-8">
          Welcome Back
        </h1>

        <input
          className="w-full rounded border border-zinc-700 bg-black p-3 mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full rounded border border-zinc-700 bg-black p-3 mb-6"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <a
  href="/forgot-password"
  className="text-purple-400 hover:text-purple-300 text-sm"
>
  Forgot password?
</a>

        <button
          onClick={login}
          className="w-full rounded-lg bg-purple-600 py-3 font-semibold hover:bg-purple-700"
        >
          Sign In
        </button>

      </div>
    </main>
  );
}