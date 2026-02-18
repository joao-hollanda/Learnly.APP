import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { HTTPClient } from "../../services/client";
import { startTokenRefresh } from "../../utils/tokenRefresh";

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await HTTPClient.get("Login/AuthCheck");
        setAuth(true);
        startTokenRefresh();
      } catch (error) {
        setAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  if (auth === null) return <div>Carregando...</div>;

  if (!auth) return <Navigate to="/" replace />;

  return children;
}
