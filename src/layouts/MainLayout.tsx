import { Outlet } from "react-router-dom";
import { AppNavbar } from "@/components/AppNavbar";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <AppNavbar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
