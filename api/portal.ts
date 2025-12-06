import Stripe from 'stripe';
import { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { customerId } = req.body;

        if (!customerId) {
            return res.status(400).json({ error: 'Missing customer ID' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
        });

        return res.status(200).json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Portal Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
