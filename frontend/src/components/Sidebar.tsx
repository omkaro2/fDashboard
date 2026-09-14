import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>fDashboard</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/analytics">Analytics</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;