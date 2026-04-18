import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import { FaRegCalendarAlt } from "react-icons/fa";
import ModalBase from "../ModalBase";
import style from "../../../Pages/inicio/_inicio.module.css";
import modalStyle from "../_modal.module.css";

function ModalCriarEvento({ show, onHide, novoEvento, setNovoEvento, onConfirmar, loading }) {
  const diasSemana = [
    { label: "Seg", value: 1 },
    { label: "Ter", value: 2 },
    { label: "Qua", value: 3 },
    { label: "Qui", value: 4 },
    { label: "Sex", value: 5 },
    { label: "Sáb", value: 6 },
    { label: "Dom", value: 0 },
  ];

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Criar evento de estudo"
      iconType="info"
      icon={<FaRegCalendarAlt />}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirmar} disabled={loading}>
            {loading ? <span className={modalStyle.spinner} /> : <><FaPlus /> Criar eventos</>}
          </Button>
        </>
      }
    >
      <div className={style.form_group}>
        <label>Nome do evento</label>
        <input
          className={style.input}
          value={novoEvento.titulo}
          onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })}
          placeholder="Ex: Matemática"
        />
      </div>
      <div className={style.horas}>
        <div className={style.form_group}>
          <label>Hora início</label>
          <input
            type="time"
            className={style.input}
            value={novoEvento.inicio}
            onChange={(e) => setNovoEvento({ ...novoEvento, inicio: e.target.value })}
          />
        </div>
        <div className={style.form_group}>
          <label>Hora fim</label>
          <input
            type="time"
            className={style.input}
            value={novoEvento.fim}
            onChange={(e) => setNovoEvento({ ...novoEvento, fim: e.target.value })}
          />
        </div>
      </div>
      <div className={style.form_group}>
        <label>Dias da semana</label>
        <div className={style.dias}>
          {diasSemana.map((dia) => (
            <button
              key={dia.value}
              className={
                novoEvento.diasSemana.includes(dia.value) ? style.dia_ativo : style.dia
              }
              onClick={() => {
                const selecionados = novoEvento.diasSemana.includes(dia.value)
                  ? novoEvento.diasSemana.filter((d) => d !== dia.value)
                  : [...novoEvento.diasSemana, dia.value];
                setNovoEvento({ ...novoEvento, diasSemana: selecionados });
              }}
            >
              {dia.label}
            </button>
          ))}
        </div>
      </div>
    </ModalBase>
  );
}

export default ModalCriarEvento;
