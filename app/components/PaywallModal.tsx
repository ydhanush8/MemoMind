'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap } from 'lucide-react';
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
        {/* Header */}
        <div>
          <Badge variant="default" className="inline-flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Pro Feature
          </Badge>
          <h2 className="text-xl font-semibold text-foreground mt-3">Unlock Pro</h2>
          <p className="text-sm text-muted-foreground mt-1">Access AI-powered learning tools</p>
        </div>

        {/* Feature list */}
        <ul className="mt-5 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{f}</span>
            </li>
          ))}
        </ul>

        {/* Pricing card */}
        <div className="mt-5 rounded-lg border border-border/50 bg-secondary/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Monthly</span>
            <span className="text-sm font-semibold text-foreground">₹99/mo</span>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-sm text-muted-foreground">Yearly</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">₹999/yr</span>
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Save ₹189
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="default"
          className="mt-5 w-full"
          onClick={handleUpgrade}
          disabled={isProcessing}
        >
          {isProcessing ? 'Loading...' : 'View pricing →'}
        </Button>
      </div>
    </DialogContent>
  );
}
