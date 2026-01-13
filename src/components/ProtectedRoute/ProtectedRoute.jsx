import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect( () => {
    if(sessionStorage.getItem("token"))
      setAuth(true)
    else
      setAuth(false)
  }, []);

  if (auth === null) return <div>Carregando...</div>;

  if (!auth) return <Navigate to="/" replace />;

  return children;
}
