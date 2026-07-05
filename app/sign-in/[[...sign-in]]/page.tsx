import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import Logo from '@/app/components/Logo';

export default function SignInPage() {
  return (
    <div className="theme-paper min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <Logo size={32} />
            <span className="text-lg font-extrabold text-foreground tracking-tight">MemoMind</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Sign in to your MemoMind account.</p>
        </div>
        <SignIn appearance={{ elements: { rootBox: 'mx-auto' } }} />
      </div>
    </div>
  );
}
