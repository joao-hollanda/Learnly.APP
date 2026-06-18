import logoBranca from "../../img/LearnlyLogoBranca.svg";
import style from "./_header.module.css";
import { NavLink } from "react-router-dom";
import { MdMenu, MdClose } from "react-icons/md";
import {
  LuLayoutDashboard,
  LuClipboardList,
  LuFileText,
  LuSparkles,
  LuChartLine,
  LuUsers,
  LuMessageSquare,
} from "react-icons/lu";
import { useState } from "react";
import Logout from "../Logout/Logout";

const NAV = [
  { to: "/home", label: "Início", icon: <LuLayoutDashboard /> },
  { to: "/desempenho", label: "Desempenho", icon: <LuChartLine /> },
  { to: "/planos", label: "Planos", icon: <LuClipboardList /> },
  { to: "/simulados", label: "Simulados", icon: <LuFileText /> },
  { to: "/mentoria", label: "MentorIA", icon: <LuSparkles /> },
  { to: "/comunidade", label: "Amigos", icon: <LuUsers /> },
  { to: "/chat", label: "Chat", icon: <LuMessageSquare /> },
];

const Header = () => {
  const [aberto, setAberto] = useState(false);

  const linkClass = ({ isActive }) =>
    `${style.link} ${isActive ? style.active : ""}`;

  const fechar = () => setAberto(false);

  return (
    <>
      <header className={style.topbar}>
        <button
          className={style.hamburger}
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
        >
          <MdMenu size={24} />
        </button>
        <NavLink to="/home" className={style.topbarLogo}>
          <img src={logoBranca} alt="Learnly" />
        </NavLink>
        <span className={style.topbarSpacer} />
      </header>

      {aberto && <div className={style.overlay} onClick={fechar} />}

      <aside className={`${style.sidebar} ${aberto ? style.sidebarAberta : ""}`}>
        <div className={style.brand}>
          <NavLink to="/home" onClick={fechar} className={style.brandLink}>
            <img src={logoBranca} alt="Learnly" className={style.brandLogo} />
          </NavLink>
          <button
            className={style.fechar}
            onClick={fechar}
            aria-label="Fechar menu"
          >
            <MdClose size={22} />
          </button>
        </div>

        <span className={style.navLabel}>Menu</span>

        <nav className={style.nav}>
          {NAV.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={fechar}
            >
              <span className={style.linkIndex}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={style.linkIcon}>{item.icon}</span>
              <span className={style.linkLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={style.sidebarFooter}>
          <Logout />
        </div>
      </aside>
    </>
  );
};

export default Header;
