import LoginAPI from "../services/LoginService";

let refreshTimer = null;

export function startTokenRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  const REFRESH_INTERVAL = 23 * 60 * 60 * 1000;

  refreshTimer = setInterval(async () => {
    try {
      await LoginAPI.RefreshToken();
      console.log("Token renovado automaticamente");
    } catch (error) {
      console.error("Erro ao renovar token automaticamente:", error);
      stopTokenRefresh();
    }
  }, REFRESH_INTERVAL);
}

export function stopTokenRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}
