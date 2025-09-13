import React from "react";
import Sidebar from "../_components/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-secondary flex min-h-screen w-full flex-col items-center md:flex-row md:items-start">
      <Sidebar />

      <div className="flex h-auto w-full items-start justify-start md:py-6 md:pr-6">
        <div className="bg-background h-full w-full rounded-3xl px-5 py-5 md:px-10 md:py-10">
          {children}
        </div>
      </div>
    </main>
  );
};

export default Layout;
