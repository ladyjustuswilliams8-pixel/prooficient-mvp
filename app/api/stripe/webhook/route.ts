import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook Error:", err.message);

    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerId = session.customer as string;

    const subscriptionId = session.subscription as string | null;

   const userId = session.metadata?.user_id;
   const plan = session.metadata?.plan ?? "starter";

if (!userId) {
  console.error("No user_id found in Stripe metadata.");
  return NextResponse.json({ received: true });
}

const { error } = await supabaseAdmin
  .from("profiles")
  .update({
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan,
    subscription_status: "active",
  })
  .eq("id", userId);

if (error) {
  console.error("Supabase update failed:", error);
}
  }

  return NextResponse.json({ received: true });
}