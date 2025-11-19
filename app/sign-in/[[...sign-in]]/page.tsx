import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-slate-800 border border-slate-700',
          },
        }}
      />
    </div>
  );
}
