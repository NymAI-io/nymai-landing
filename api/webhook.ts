import Stripe from 'stripe';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './_lib/supabase-admin.ts';
import { buffer } from 'micro';

// Disable body parsing, we need the raw body for signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    let event: Stripe.Event;

    try {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature']!;

        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const subscriptionId = session.subscription as string;

                if (userId && subscriptionId) {
                    // Fetch subscription details to get status and price
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Stripe.Subscription;

                    // 1. Update Profile with Billing Customer ID
                    await supabaseAdmin
                        .from('profiles')
                        .update({ billing_customer_id: session.customer as string })
                        .eq('id', userId);

                    // 2. Insert/Update Subscription
                    await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        status: subscription.status,
                        price_id: subscription.items.data[0].price.id,
                        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                    });
                }
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId; // We stored this in subscription_data in checkout

                if (userId) {
                    await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        status: subscription.status,
                        price_id: subscription.items.data[0].price.id,
                        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                    });
                } else {
                    // Fallback: If metadata is missing (legacy?), try finding by customer_id if stored in profiles
                    // Note: In this simple setup, we rely on metadata. 
                    console.warn('Subscription updated but missing userId in metadata:', subscription.id);
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Webhook handler failed:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
}
