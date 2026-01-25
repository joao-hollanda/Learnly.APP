import { useNavigate } from "react-router-dom";
import style from "./_logout.module.css";
import { RiLogoutBoxLine } from "react-icons/ri";

const Logout = () => {

    const navigate = useNavigate();
      
    function handleLogout() {
        sessionStorage.removeItem("token");
        navigate("/")
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