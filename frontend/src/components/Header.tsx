function Header() {
  return (
    <header className="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back to your financial dashboard.</p>
      </div>

      <div className="header-actions">
        <span>Notifications</span>
        <span>Profile</span>
      </div>
    </header>
  );
}

export default Header;