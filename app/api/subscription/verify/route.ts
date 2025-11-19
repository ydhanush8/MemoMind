import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';
import connectDB from '@/app/lib/mongodb';
import Subscription from '@/app/lib/models/Subscription';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
    } = body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    await connectDB();

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    
    if (planType === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        plan: 'premium',
        planType: planType || 'monthly',
        status: 'active',
        razorpaySubscriptionId: razorpay_subscription_id,
        currentPeriodStart,
        currentPeriodEnd,
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ success: true, message: 'Subscription activated!' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
