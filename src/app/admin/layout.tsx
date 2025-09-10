import React from "react";
import Sidebar from "../_components/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-secondary flex min-h-screen w-full flex-row">
      <Sidebar />

      <div className="flex h-auto w-full items-start justify-start py-6 pr-6">
        <div className="bg-background h-full w-full rounded-3xl px-10 py-10">
          {children}
        </div>
      </div>
    </main>
  );
};

export default Layout;
