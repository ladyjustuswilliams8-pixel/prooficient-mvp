"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function sendReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Password reset email sent. Check your inbox."
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">

      <div className="w-full max-w-md space-y-5">

        <h1 className="text-3xl font-bold text-purple-500">
          Reset Password
        </h1>

        <p className="text-gray-400">
          Enter your email and we'll send you a reset link.
        </p>

        <input
          className="w-full rounded border p-3 text-black"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <button
          onClick={sendReset}
          className="w-full rounded bg-purple-600 p-3 font-semibold"
        >
          Send Reset Link
        </button>

        {message && (
          <p className="text-sm text-gray-300">
            {message}
          </p>
        )}

      </div>

    </main>
  );
}