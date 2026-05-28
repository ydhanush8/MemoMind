import Subscription from './models/Subscription';

export async function isUserPremium(userId: string): Promise<boolean> {
  const sub = await Subscription.findOne({ userId }, { plan: 1, status: 1 }).lean() as
    | { plan: string; status: string }
    | null;
  return sub?.plan === 'premium' && sub?.status === 'active';
}
