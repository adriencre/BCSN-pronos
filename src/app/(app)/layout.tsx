import BottomTabBar from "@/components/BottomTabBar";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import PullToRefresh from "@/components/PullToRefresh";
import { getCurrentUser } from "@/lib/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-bg-base bg-texture">
        <PwaInstallPrompt />
        <main className="pb-36 max-w-md mx-auto">{children}</main>
        <BottomTabBar userRole={user?.role} />
      </div>
    </PullToRefresh>
  );
}
