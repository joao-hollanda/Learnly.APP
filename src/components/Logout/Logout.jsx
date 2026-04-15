import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import style from "./_logout.module.css";
import { RiLogoutBoxLine } from "react-icons/ri";
import LoginAPI from "../../services/LoginService";
import { stopTokenRefresh } from "../../utils/tokenRefresh";

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
            queryClient.invalidateQueries({ queryKey: ["planos"] });
            queryClient.invalidateQueries({ queryKey: ["resumo"] });
            queryClient.invalidateQueries({ queryKey: ["planoAtivo"] });
            queryClient.invalidateQueries({ queryKey: ["comparacaoHoras"] });
            queryClient.invalidateQueries({ queryKey: ["totalSimulados"] });
            queryClient.clear();

            sessionStorage.removeItem("id");
            sessionStorage.removeItem("nome");
            navigate("/");
        }
    }

    return (
        <>
            <button
                onClick={handleLogout}
                className={style.logout}
            >
                <RiLogoutBoxLine />
            </button>
        </>
    );
};

export default Logout;