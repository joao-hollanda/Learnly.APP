import { Button, Modal } from "react-bootstrap";
import { BsCheckLg, BsGear, BsPlus } from "react-icons/bs";
import Select from "react-select";
import { toast } from "react-toastify";
import style from "../../../Pages/planos/_planos.module.css";

function ModalConfigurarPlano({
  show,
  onHide,
  materiasDisponiveis,
  materiasDoPlano,
  materiaId,
  setMateriaId,
  horasTotais,
  setHorasTotais,
  onAdicionarMateria,
  onConcluir,
  loading,
}) {
  return (
    <Modal show={show} centered onHide={onHide}>
      <Modal.Header closeButton>
        <div className="modal-icon modal-icon-info">
          <BsGear />
        </div>
        <Modal.Title>Configurar plano</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Select
          options={materiasDisponiveis.map((m) => ({
            value: m.materiaId,
            label: m.nome,
            isDisabled: materiasDoPlano.some((pm) => pm.nome === m.nome),
          }))}
          value={
            materiaId
              ? materiasDisponiveis
                  .map((m) => ({ value: m.materiaId, label: m.nome }))
                  .find((o) => o.value === materiaId) || null
              : null
          }
          onChange={(selected) => setMateriaId(selected?.value || "")}
          placeholder="Selecione a matéria"
          isClearable
        />
        {materiasDisponiveis.filter(
          (m) => !materiasDoPlano.some((pm) => pm.nome === m.nome),
        ).length === 0 && (
          <small className="text-muted mt-1 d-block">
            Todas as matérias já foram adicionadas
          </small>
        )}
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label
              className="fw-semibold"
              style={{ fontSize: "0.875rem", color: "#475569" }}
            >
              Horas totais
            </label>
            <span className="modal-badge modal-badge-info" style={{ marginTop: 0 }}>
              {horasTotais || 0}h
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={200}
            step={1}
            value={horasTotais || 5}
            onChange={(e) => setHorasTotais(+e.target.value)}
            className="form-range"
          />
          <input
            type="number"
            min={5}
            max={200}
            className="form-control mt-1"
            placeholder="Ou digite o valor (5–200)"
            value={horasTotais || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return setHorasTotais("");
              const num = +v;
              if (num < 5 || num > 200) return;
              setHorasTotais(num);
            }}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onAdicionarMateria}>
          {loading ? (
            <span className={style.spinner} />
          ) : (
            <>
              <BsPlus /> Adicionar
            </>
          )}
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (materiasDoPlano.length === 0)
              return toast.warn("Adicione ao menos uma matéria ao plano");
            onConcluir();
          }}
        >
          <BsCheckLg /> Concluir
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalConfigurarPlano;