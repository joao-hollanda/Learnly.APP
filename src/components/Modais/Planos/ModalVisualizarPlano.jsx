import { BsClock, BsBookHalf, BsGear, BsJournalX, BsPlus } from "react-icons/bs";
import Card from "../../Card/Card";
import ModalBase from "../ModalBase";
import style from "../../../Pages/planos/_planos.module.css";

function ModalVisualizarPlano({ show, onHide, plano, onConfigurar, onLancarHoras }) {
  const materias = plano?.materias ?? [];

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title={plano?.titulo ?? "Plano"}
      subtitle={plano?.objetivo}
      kicker="Plano de estudo"
      iconType="info"
      icon={<BsBookHalf />}
      size="xl"
      headerAction={
        <button
          type="button"
          className="ly-modal-headbtn"
          onClick={onConfigurar}
          title="Configurar plano"
          aria-label="Configurar plano"
        >
          <BsGear />
        </button>
      }
    >
      {materias.length === 0 ? (
        <div className={style.semMaterias}>
          <span className={style.semMateriasIcone}>
            <BsJournalX />
          </span>
          <p className={style.semMateriasTitulo}>Nenhuma matéria no plano</p>
          <p className={style.semMateriasTexto}>
            Adicione matérias para organizar seus estudos e começar a lançar
            horas.
          </p>
          <button
            className={`${style.botao} ${style.semMateriasBtn}`}
            onClick={onConfigurar}
          >
            <BsPlus /> Adicionar matérias
          </button>
        </div>
      ) : (
        <div className={style.cards}>
          {materias.map((pm, i) => {
            const progresso = (pm.horasConcluidas / pm.horasTotais) * 100 || 0;
            return (
              <Card key={i} titulo={pm.nome}>
                <div className={style.materiaBody}>
                  {pm.topicos?.length > 0 && (
                    <div className={style.topicos}>
                      <strong>Tópicos</strong>
                      <ul>
                        {pm.topicos.map((topico, index) => (
                          <li key={index}>{topico}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className={style.materiaFooter}>
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
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ModalBase>
  );
}

export default ModalVisualizarPlano;
