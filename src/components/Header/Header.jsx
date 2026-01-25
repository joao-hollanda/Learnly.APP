import logo from "../../img/LearnlyLogo.svg";
import style from "../Header/_header.module.css";
import { NavLink } from "react-router-dom";
import { MdMenu, MdClose } from "react-icons/md";
import { useState } from "react";

const Header = ({ children }) => {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className={style.headerWrapper}>
      <header className={style.header}>
        <div className={style.menu} onClick={() => setMenuAberto(!menuAberto)}>
          {menuAberto ? <MdClose size={32} /> : <MdMenu size={32} />}
        </div>

        <div className={style.logoArea}>
          <img src={logo} alt="Logo" className={style.logoIcon} />
        </div>

        <nav className={`${style.nav} ${menuAberto ? style.showMenu : ""}`}>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `${style.link} ${isActive ? style.active : style.inactive}`
            }
            onClick={() => setMenuAberto(false)}
          >
            Início
          </NavLink>

          <NavLink
            to="/planos"
            className={({ isActive }) =>
              `${style.link} ${isActive ? style.active : style.inactive}`
            }
            onClick={() => setMenuAberto(false)}
          >
            Planos
          </NavLink>

          <NavLink
            to="/simulados"
            className={({ isActive }) =>
              `${style.link} ${isActive ? style.active : style.inactive}`
            }
            onClick={() => setMenuAberto(false)}
          >
            Simulados
          </NavLink>

          <NavLink
            to="/mentoria"
            className={({ isActive }) =>
              `${style.link} ${isActive ? style.active : style.inactive}`
            }
            onClick={() => setMenuAberto(false)}
          >
            MentorIA
          </NavLink>
        </nav>

        <div className={style.botao}>{children}</div>
      </header>
    </div>
  );
};

export default Header;
