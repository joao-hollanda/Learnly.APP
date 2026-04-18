import { BsClock, BsBookHalf, BsGear } from "react-icons/bs";
import Card from "../../Card/Card";
import ModalBase from "../ModalBase";
import style from "../../../Pages/planos/_planos.module.css";

function ModalVisualizarPlano({ show, onHide, plano, onConfigurar, onLancarHoras }) {
  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title={plano?.titulo ?? "Plano"}
      iconType="info"
      icon={<BsBookHalf />}
      size="xl"
      headerAction={
        <button
          onClick={onConfigurar}
          title="Configurar plano"
          style={{
            background: "none",
            border: "none",
            padding: 4,
            cursor: "pointer",
            opacity: 0.35,
            fontSize: "1.4rem",
            lineHeight: 1,
            transition: "opacity 0.15s, transform 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; e.currentTarget.style.transform = "rotate(45deg)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.35"; e.currentTarget.style.transform = "rotate(0deg)"; }}
        >
          <BsGear />
        </button>
      }
    >
      <div className={style.cards}>
        {plano?.materias?.map((pm, i) => {
          const progresso = (pm.horasConcluidas / pm.horasTotais) * 100 || 0;
          return (
            <Card key={i} titulo={pm.nome} centralizado={true}>
              {pm.topicos?.length > 0 && (
                <div className={style.topicos} style={{ textAlign: "center" }}>
                  <strong>Tópicos:</strong>
                  <ul style={{ textAlign: "left" }}>
                    {pm.topicos.map((topico, index) => (
                      <li key={index}>{topico}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className={style.horas}>
                <BsClock size={12} /> {pm.horasConcluidas}h / {pm.horasTotais}h
              </p>
              <div className={style.progress}>
                <div
                  className={style.progress_bar}
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <button
                className={`${style.botao} ${style.full}`}
                onClick={() => onLancarHoras(pm)}
              >
                Lançar horas
              </button>
            </Card>
          );
        })}
      </div>
    </ModalBase>
  );
}

export default ModalVisualizarPlano;
