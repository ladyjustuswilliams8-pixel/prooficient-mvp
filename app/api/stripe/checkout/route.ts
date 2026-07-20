import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { priceId, plan } = await req.json();
    const supabase = await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json(
    { error: "Not authenticated" },
    { status: 401 }
  );
}

    const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  payment_method_types: ["card"],



  metadata: {
    user_id: user.id,
    email: user.email ?? "",
    plan,
  },

  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],

  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
});

    return NextResponse.json({
      url: session.url,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to create checkout session",
      },
      { status: 500 }
    );
  }
}