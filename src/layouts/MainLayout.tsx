import { Outlet } from "react-router-dom";
import { AppNavbar } from "@/components/AppNavbar";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
