'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { DialogContent } from '@/app/components/ui/dialog';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  'AI Analysis — instant feedback on your understanding',
  'Daily Practice — spaced repetition flip cards',
  'Review tracking — never forget what you learned',
];

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsProcessing(true);
    router.push('/pricing');
  };

  return (
    <DialogContent className="max-w-sm" onClose={onClose}>
      <div className="p-6">
        <Badge variant="default" className="inline-flex items-center gap-1.5">
          <Crown className="w-3 h-3" />
          Pro Feature
        </Badge>
        <h2 className="text-xl font-extrabold text-foreground mt-3 tracking-tight">Unlock Pro</h2>
        <p className="text-sm text-muted-foreground mt-1">Access AI-powered learning tools.</p>

        <ul className="mt-5 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/12 shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </span>
              <span className="text-sm text-foreground">{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl border border-border/60 bg-secondary/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Monthly</span>
            <span className="text-sm font-bold text-foreground">₹99/mo</span>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-sm text-muted-foreground">Yearly</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">₹999/yr</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/12 px-1.5 py-0.5 rounded-full">
                Save ₹189
              </span>
            </div>
          </div>
        </div>

        <Button className="mt-5 w-full" onClick={handleUpgrade} disabled={isProcessing}>
          {isProcessing ? 'Loading...' : 'View pricing →'}
        </Button>
      </div>
    </DialogContent>
  );
}
