import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-section">
        <Header />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;