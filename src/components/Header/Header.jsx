import logo from "../../img/LearnlyLogo.svg";
import style from "../Header/_header.module.css";
import { NavLink } from "react-router-dom";
import { MdMenu, MdClose } from "react-icons/md";
import { useState } from "react";

const Header = ({children}) => {
    const [menuAberto, setMenuAberto] = useState(false);

    return (
        <div className={style.headerWrapper}>
            <header className={style.header}>
                <div className={style.logoArea}>
                    <img src={logo} alt="Logo" className={style.logoIcon} />
                </div>

                <nav className={`${style.nav} ${menuAberto ? style.showMenu : ""}`}>
                    <NavLink
                        to="/home"
                        className={({ isActive }) =>
                            isActive ? style.active : style.inactive
                        }
                        onClick={() => setMenuAberto(false)}
                    >
                        Início
                    </NavLink>
                    <NavLink
                        to="/planos"
                        className={({ isActive }) =>
                            isActive ? style.active : style.inactive
                        }
                        onClick={() => setMenuAberto(false)}
                    >
                        Planos
                    </NavLink>
                    <NavLink
                        to="/simulados"
                        className={({ isActive }) =>
                            isActive ? style.active : style.inactive
                        }
                        onClick={() => setMenuAberto(false)}
                    >
                        Simulados
                    </NavLink>
                    <NavLink
                        to="/desempenho"
                        className={({ isActive }) =>
                            isActive ? style.active : style.inactive
                        }
                        onClick={() => setMenuAberto(false)}
                    >
                        Desempenho
                    </NavLink>
                </nav>

                <div className={style.menu} onClick={() => setMenuAberto(!menuAberto)}>
                    {menuAberto ? <MdClose size={28} /> : <MdMenu size={28} />}
                </div>
                <div className={style.botao}>{children}</div>
            </header>
        </div>
    );
};

export default Header;
