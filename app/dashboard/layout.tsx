import Sidebar from '@/app/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-[17rem]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 pt-20 pb-28 lg:pt-10 lg:pb-14">
          {children}
        </div>
      </div>
    </div>
  );
}
