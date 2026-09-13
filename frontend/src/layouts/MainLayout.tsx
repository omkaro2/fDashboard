import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <header>
        <h2>fDashboard</h2>
      </header>

      <main>{children}</main>
    </div>
  );
}

export default MainLayout;