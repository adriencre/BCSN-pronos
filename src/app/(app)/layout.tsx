import BottomTabBar from "@/components/BottomTabBar";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import { getCurrentUser } from "@/lib/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-bg-base bg-texture pt-14">
      <PwaInstallPrompt />
      <main className="pb-36 max-w-md mx-auto">{children}</main>
      <BottomTabBar userRole={user?.role} />
    </div>
  );
}
