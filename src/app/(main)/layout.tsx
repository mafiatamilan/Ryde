import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/topnav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastProvider } from "@/components/toast-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <TopNav />
        <ToastProvider>
          <main className="flex-1">{children}</main>
        </ToastProvider>
      </div>
      <BottomNav />
    </div>
  );
}