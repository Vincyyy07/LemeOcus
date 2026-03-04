import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 relative z-10 overflow-auto">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
