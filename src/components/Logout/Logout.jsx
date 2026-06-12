import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import style from "./_logout.module.css";
import { RiLogoutBoxLine } from "react-icons/ri";
import LoginAPI from "../../services/LoginService";
import { stopTokenRefresh } from "../../utils/tokenRefresh";
import { limparIdentidade, registrarEvento } from "../../utils/analytics";

const Logout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
      
    async function handleLogout() {
        try {
            stopTokenRefresh();
            await LoginAPI.Logout();
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        } finally {
            registrarEvento("logout");
            limparIdentidade();
            queryClient.clear();

            sessionStorage.removeItem("id");
            sessionStorage.removeItem("nome");
            sessionStorage.removeItem("simulado");
            sessionStorage.removeItem("respostas");
            localStorage.removeItem("mentorSessao");
            navigate("/");
        }
    }

    return (
        <button onClick={handleLogout} className={style.logout}>
            <RiLogoutBoxLine />
            <span>Sair</span>
        </button>
    );
};

export default Logout;