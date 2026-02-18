import { useNavigate } from "react-router-dom";
import style from "./_logout.module.css";
import { RiLogoutBoxLine } from "react-icons/ri";
import LoginAPI from "../../services/LoginService";
import { stopTokenRefresh } from "../../utils/tokenRefresh";

const Logout = () => {

    const navigate = useNavigate();
      
    async function handleLogout() {
        try {
            stopTokenRefresh();
            await LoginAPI.Logout();
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        } finally {
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