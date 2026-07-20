"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signup() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          selected_plan: plan,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setMessage(
          "This email already has an account. Try logging in."
        );
      } else {
        setMessage(error.message);
      }

      return;
    }

    if (data.user && plan) {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan,
        }),
      });

      const checkout = await res.json();

      if (checkout.url) {
        window.location.href = checkout.url;
        return;
      }
    }

    if (data.user) {
      window.location.href = "/";
      return;
    }

    alert("Account created! Check your email to verify.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4">

        <h1 className="text-3xl font-bold">
          Create your Prooficient account
        </h1>

        <input
          className="w-full rounded border p-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded border p-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <p className="text-sm text-red-400">
            {message}
          </p>
        )}

        <button
          onClick={signup}
          className="w-full rounded bg-black p-3 text-white"
        >
          Create Account
        </button>

      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}