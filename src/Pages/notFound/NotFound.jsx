import { Link, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuHouse } from "react-icons/lu";
import estilo from "./_notFound.module.css";
import logo from "../../img/LearnlyLogoBranca.svg";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={estilo.tela}>
      <span className={estilo.orb1} aria-hidden="true" />
      <span className={estilo.orb2} aria-hidden="true" />
      <span className={estilo.grade} aria-hidden="true" />

      <div className={estilo.conteudo}>
        <img src={logo} alt="Learnly" className={estilo.logo} />
        <span className={estilo.kicker}>Erro 404</span>

        <div className={estilo.numero} aria-hidden="true">
          <span>4</span>
          <span className={estilo.zero}>
            0<i className={estilo.satelite} />
          </span>
          <span>4</span>
        </div>

        <h1 className={estilo.titulo}>Página não encontrada</h1>
        <p className={estilo.subtitulo}>
          O endereço que você tentou acessar não existe ou foi movido. Vamos te
          levar de volta aos estudos.
        </p>

        <div className={estilo.acoes}>
          <Link to="/home" className={estilo.botaoPrimario}>
            <LuHouse /> Ir para o início
          </Link>
          <button
            type="button"
            className={estilo.botaoFantasma}
            onClick={() => navigate(-1)}
          >
            <LuArrowLeft /> Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
