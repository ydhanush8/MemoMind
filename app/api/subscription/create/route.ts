import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Razorpay from 'razorpay';
import connectDB from '@/app/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planType } = body;

    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const planId =
      planType === 'monthly'
        ? process.env.RAZORPAY_PLAN_ID_MONTHLY
        : process.env.RAZORPAY_PLAN_ID_YEARLY;

    if (!planId) {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    await connectDB();

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: planType === 'monthly' ? 12 : 1,
      notes: {
        userId: userId,
        planType: planType,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
