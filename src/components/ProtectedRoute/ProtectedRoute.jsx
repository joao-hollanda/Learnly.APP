import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { HTTPClient } from "../../services/client";
import { startTokenRefresh } from "../../utils/tokenRefresh";

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(() =>
    sessionStorage.getItem("recemLogado") === "1" ? true : null,
  );

  useEffect(() => {
    if (sessionStorage.getItem("recemLogado") === "1") {
      sessionStorage.removeItem("recemLogado");
      startTokenRefresh();
      return;
    }

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

  if (auth === null) return null;

  if (!auth) return <Navigate to="/" replace />;

  return children;
}
