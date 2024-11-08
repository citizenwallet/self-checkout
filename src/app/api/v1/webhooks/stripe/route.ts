import { getServiceRoleClient } from "@/db";
import { completeOrder } from "@/db/orders";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");

  if (!endpointSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    const error = err as Error;
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Log the metadata
    console.log("Checkout Session Completed. Metadata:", session.metadata);

    const amount = session.metadata?.amount;
    if (!amount) {
      return NextResponse.json({ error: "No amount" }, { status: 400 });
    }

    const account = session.metadata?.account;
    if (!account) {
      return NextResponse.json({ error: "No account" }, { status: 400 });
    }

    const orderId = parseInt(session.metadata?.orderId ?? "0");
    if (!orderId || isNaN(orderId)) {
      return NextResponse.json({ error: "No orderId" }, { status: 400 });
    }

    const client = getServiceRoleClient();
    const { data, error } = await completeOrder(client, orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // const community = new CommunityConfig(Config);

    // const bundler = new BundlerService(community);
    // await bundler.mintERC20Token(account, amount);

    console.log("Order paid", data);
  }

  return NextResponse.json({ received: true });
}
