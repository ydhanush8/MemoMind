import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <SignUp
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
