import { useEffect, useState } from "react";
import { authService } from "../services/authService";

const Header = () => {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const user = authService.getStoredUser();

    if (user?.name) {
      setUserName(user.name);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.replace("/login");
  };

  return (
    <header className="header">
      <div className="header-title">
        <h1>Dashboard</h1>
        <p>Welcome back to your financial dashboard.</p>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="header-link"
          onClick={() => console.log("Notifications clicked")}
        >
          Notifications
        </button>

        <button
          type="button"
          className="header-link"
        >
          {userName}
        </button>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;