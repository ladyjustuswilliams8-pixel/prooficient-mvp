import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function updateBySubscriptionId(
  subscriptionId: string,
  updates: Record<string, any>
) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error("Supabase subscription update failed:", error);
  }
}

async function updateByCustomerId(
  customerId: string,
  updates: Record<string, any>
) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Supabase customer update failed:", error);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string | null;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          console.error("Missing checkout metadata.");
          break;
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
          console.error("Checkout profile update failed:", error);
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const activeStatuses = ["active", "trialing"];
        const subscriptionStatus = activeStatuses.includes(subscription.status)
          ? "active"
          : subscription.status;

        await updateBySubscriptionId(subscription.id, {
          subscription_status: subscriptionStatus,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await updateBySubscriptionId(subscription.id, {
          subscription_status: "inactive",
        });

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string | null;

        if (customerId) {
          await updateByCustomerId(customerId, {
            subscription_status: "active",
          });
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string | null;

        console.warn(
          "Stripe invoice payment failed for customer:",
          customerId
        );

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
