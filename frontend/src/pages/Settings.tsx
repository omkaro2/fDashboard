import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../services/authService";

interface User {
  id?: string;
  name: string;
  email: string;
}

const Settings = () => {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadUser =
      async () => {
        try {
          const response =
            await authService.getCurrentUser();

          if (
            !response.success ||
            !response.user
          ) {
            authService.logout();

            navigate("/login", {
              replace: true,
            });

            return;
          }

          setUser(
            response.user
          );
        } catch (requestError) {
          console.error(
            "Settings user error:",
            requestError
          );

          setError(
            "Unable to load account information."
          );
        } finally {
          setLoading(false);
        }
      };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h1>Settings</h1>

        <p>
          Manage your Financial Dashboard
          account.
        </p>
      </div>

      {loading ? (
        <div className="loading-state">
          Loading account information...
        </div>
      ) : error ? (
        <div className="error-state">
          {error}
        </div>
      ) : (
        <>
          <section className="dashboard-section">

            <h2>
              Account Information
            </h2>

            <div className="settings-grid">

              <div className="settings-item">
                <span className="settings-label">
                  Name
                </span>

                <strong>
                  {user?.name ||
                    "—"}
                </strong>
              </div>

              <div className="settings-item">
                <span className="settings-label">
                  Email
                </span>

                <strong>
                  {user?.email ||
                    "—"}
                </strong>
              </div>

              <div className="settings-item">
                <span className="settings-label">
                  Account Status
                </span>

                <strong>
                  Active
                </strong>
              </div>

              <div className="settings-item">
                <span className="settings-label">
                  Authentication
                </span>

                <strong>
                  JWT Protected
                </strong>
              </div>

            </div>

          </section>

          <section className="dashboard-section">

            <h2>
              Session
            </h2>

            <p>
              Sign out from your Financial
              Dashboard account.
            </p>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              style={{
                marginTop: "16px",
              }}
            >
              Logout
            </button>

          </section>
        </>
      )}

    </div>
  );
};

export default Settings;