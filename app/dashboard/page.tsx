import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, subscription_status")
    .eq("id", user.id)
    .single();
    const today = new Date().toISOString().split("T")[0];

const { data: usage } = await supabase
  .from("usage_logs")
  .select("analysis_count")
  .eq("user_id", user.id)
  .eq("created_at", today)
  .maybeSingle();

const currentUsage = usage?.analysis_count ?? 0;

const limits: Record<string, number> = {
  starter: 1,
  pro: 30,
  power: 100,
};

const dailyLimit = limits[profile?.plan ?? "starter"];

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-5xl font-bold text-purple-500 mb-8">
          Welcome back 👋
        </h1>

        <div className="grid gap-6 md:grid-cols-2">

          <div className="rounded-xl border border-purple-600 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Account
            </h2>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p className="mt-2">
              <strong>Plan:</strong> {profile?.plan ?? "Free"}
            </p>

            <p className="mt-2">
              <strong>Status:</strong>{" "}
              {profile?.subscription_status ?? "Inactive"}
            </p>
          </div>

          <div className="rounded-xl border border-purple-600 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Usage
            </h2>
            

            <p>Today's analyses</p>

           <p className="mt-3 text-4xl font-bold">
  {currentUsage} / {dailyLimit}
</p>
          </div>
          
          <div className="mt-8 flex justify-center">
  <LogoutButton />
</div>

        </div>
      </div>
    </main>
  );
}