import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "../services/authService";

const ProtectedRoute = () => {
  const location = useLocation();

  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;