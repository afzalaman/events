export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

import { createOrder } from "@/lib/actions/order.actions";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Instantiate Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });

// POST Handler
export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const body = await getRawBody(request);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  // Handle event type
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { eventId, buyerId } = session.metadata!;
    const totalAmount = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0";

    try {
      const newOrder = await createOrder({
        stripeId: session.id,
        totalAmount,
        eventId,
        buyerId,
        createdAt: new Date(),
      });

      console.log("Order created successfully:", newOrder);
    } catch (err) {
      console.error("Order creation failed:", err);
      return NextResponse.json({ message: "Order creation failed", error: err }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// Helper to parse raw body
async function getRawBody(request: Request): Promise<Buffer> {
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value!);
  }
  return Buffer.concat(chunks);
}