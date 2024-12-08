import { createOrder } from "@/lib/actions/order.actions";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export const config = {
  api: {
    bodyParser: false, // Ensure raw body for Stripe signature
  },
};

export async function POST(request: Request) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const sig = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  // Parse raw body for signature verification
  const body = await getRawBody(request);

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Stripe Webhook Error:", err.message);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  const eventType = event.type;

  if (eventType === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract metadata
    const { eventId, buyerId } = session.metadata!;
    const totalAmount = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0";

    try {
      // Create the order in MongoDB
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

  // Return a response for unsupported event types
  return NextResponse.json({ received: true }, { status: 200 });
}

// Helper function to parse raw body
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