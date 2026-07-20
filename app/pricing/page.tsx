"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Starter",
    price: "$15/mo",
    priceId: "price_1TppQjBLsee5vnVYvUipoBZ5",
    features: [
      "1 AI analyses per day",
      "Live web verification",
      "Evidence & source links",
      "ProofScore™ report",
    ],
  },
  {
    name: "Pro",
    price: "$30/mo",
    priceId: "price_1TppRUBLsee5vnVYrnba4LRf",
    features: [
      "30 AI analyses per day",
      "Everything in Starter",
      "Faster processing",
      "Priority support",
    ],
  },
  {
    name: "Power",
    price: "$99/mo",
    priceId: "price_1TppS1BLsee5vnVYNvwZdU3u",
    features: [
      "100 AI analyses per day",
      "Everything in Pro",
      "Highest priority processing",
      "Early access to new features",
    ],
  },
];

export default function PricingPage() {
    const router = useRouter();
const supabase = createClient();
  async function subscribe(priceId: string, plan: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.push(`/signup?plan=${priceId}`);
    return;
  }

  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
  priceId,
  plan
}),
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Unable to start checkout.");
  }
}
    
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold text-center text-purple-500 mb-4">
        Prooficient Pricing
      </h1>

      <p className="text-center text-gray-300 mb-12">
        Choose the plan that's right for you.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="border border-purple-600 rounded-xl p-6 bg-zinc-900"
          >
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>

            <p className="text-4xl text-purple-400 mb-6">
              {plan.price}
            </p>

            <ul className="space-y-2 mb-8">
              {plan.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>

            <button
              onClick={() => subscribe(plan.priceId, plan.name.toLowerCase())}
              className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-semibold"
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}