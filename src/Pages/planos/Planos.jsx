import { Button, Modal } from "react-bootstrap";
import Header from "../../components/Header/Header";
import Plano from "../../components/Plano/Plano";
import style from "./_planos.module.css";
import { useState } from "react";
import { FaPlay, FaPlus } from "react-icons/fa6";
import "bootstrap/dist/css/bootstrap.min.css";
import Card from "../../components/Card/Card";
import { toast } from "react-toastify";

function Planos() {
  const [mostrarPlano, setMostrarPlano] = useState(false);
  const [mostrarLancarHoras, setMostrarLancarHoras] = useState(false);

  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [horasLancar, setHorasLancar] = useState("");

  const [planoAtivoIndex, setPlanoAtivoIndex] = useState(0);
  const [viewingIndex, setViewingIndex] = useState(null);

  const [planosList, setPlanosList] = useState([
    {
      titulo: "Enem 2025",
      objetivo: "Atingir 800+ no ENEM 2025",
      periodo: "01/10/2024 → 30/06/2025",
      materias: [
        { nome: "Matemática", cor: "red", horasTotais: 5, horasConcluidas: 5 },
        { nome: "Português", cor: "blue", horasTotais: 10, horasConcluidas: 8 },
        { nome: "Inglês", cor: "green", horasTotais: 20, horasConcluidas: 10 },
        { nome: "Química", cor: "purple", horasTotais: 5, horasConcluidas: 0 },
      ],
    },
    {
      titulo: "Vestibular Unifal",
      objetivo: "Passar no vestibular Unifal",
      periodo: "01/10/2024",
      materias: [
        { nome: "História", cor: "orange", horasTotais: 8, horasConcluidas: 3 },
        { nome: "Geografia", cor: "teal", horasTotais: 6, horasConcluidas: 2 },
      ],
    },
    {
      titulo: "Instituto Federal",
      objetivo: "Entrar no IF",
      periodo: "01/01/2025 → 01/12/2025",
      materias: [
        { nome: "Física", cor: "purple", horasTotais: 10, horasConcluidas: 0 },
        { nome: "Biologia", cor: "green", horasTotais: 7, horasConcluidas: 1 },
      ],
    },
    {
      titulo: "Vestibular UFMG",
      objetivo: "Passar na prova da UFMG",
      periodo: "01/01/2025 → 01/12/2025",
      materias: [
        { nome: "Física", cor: "purple", horasTotais: 10, horasConcluidas: 0 },
        { nome: "Biologia", cor: "green", horasTotais: 7, horasConcluidas: 1 },
        { nome: "Hostoria", cor: "orange", horasTotais: 3, horasConcluidas: 1 },
      ],
    },
  ]);

  const handleClickPlano = (index) => {
    setViewingIndex(index);
    setMostrarPlano(true);
  };

  const handleFecharPlano = () => {
    setMostrarPlano(false);
    setViewingIndex(null);
  };

  const handleClickCriar = () => {

  };

  const handleAtivarPlano = (index) => {
    setPlanoAtivoIndex(index);
    setMostrarPlano(false);
  };

  const handleClickLancarHoras = () => {
    setMostrarLancarHoras(true);
    setMostrarPlano(false);
  };

  const handleFecharLancarHoras = () => {
    setMostrarLancarHoras(false);
    setMostrarPlano(true);
  };

  const handleConfirmarLancamento = () => {
    if (!materiaSelecionada || !horasLancar)
      return toast("Preencha todos os campos!");

    setPlanosList((prev) =>
      prev.map((plano, index) => {
        if (index !== planoAtivoIndex) return plano;

        const novasMaterias = plano.materias.map((m) => {
          if (m.nome === materiaSelecionada) {
            const novaQtd = Math.min(
              m.horasConcluidas + Number(horasLancar),
              m.horasTotais
            );
            return { ...m, horasConcluidas: novaQtd };
          }
          return m;
        });

        return { ...plano, materias: novasMaterias };
      })
    );

    setMateriaSelecionada("");
    setHorasLancar("");
    setMostrarLancarHoras(false);
  };

  const currentPlano = viewingIndex !== null ? planosList[viewingIndex] : null;
  const planoAtivo = planosList[planoAtivoIndex];

  return (
    <div>
      <Header
        children={
          <button className={style.criar} onClick={handleClickCriar}>
            <FaPlus />
          </button>
        }
      />

      <div className={style.container}>
        <h4 className={style.atividade}>Plano Atual</h4>
        <Plano
          titulo={planoAtivo.titulo}
          ativo={true}
          materias={planoAtivo.materias}
          botao={
            <div className={style.botao}>
              <button
                className={style.botao_exibir}
                onClick={() => handleClickPlano(planoAtivoIndex)}
              >
                <FaPlay color="#FFFFFF" /> <span>Visualizar Plano</span>
              </button>
            </div>
          }
        />
      </div>

      <h4 className={style.atividade}>Planos Inativos</h4>
      <div className={style.planos_container}>
        {planosList.map((plano, idx) => {
          if (idx === planoAtivoIndex) return null;
          return (
            <Plano
              key={idx}
              titulo={plano.titulo}
              ativo={false}
              materias={plano.materias}
              botao={
                <div className={style.botao}>
                  <button
                    className={style.botao_exibir}
                    onClick={() => handleClickPlano(idx)}
                  >
                    <FaPlay color="#FFFFFF" /> <span>Visualizar Plano</span>
                  </button>
                </div>
              }
            />
          );
        })}
      </div>

      <Modal size="lg" centered show={mostrarPlano} onHide={handleFecharPlano}>
        <Modal.Header>
          <Modal.Title className={style.modal_titulo}>
            <h4>{currentPlano ? currentPlano.titulo : ""}</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={style.modal_corpo}>
          {currentPlano && (
            <>
              <p>
                <strong>Objetivo:</strong> {currentPlano.objetivo}
              </p>
              <p>
                <strong>Período:</strong> {currentPlano.periodo}
              </p>

              <div className={style.cards}>
                {currentPlano.materias.map((materia, index) => {
                  const progresso =
                    (materia.horasConcluidas / materia.horasTotais) * 100 || 0;
                  return (
                    <Card
                      key={index}
                      titulo={materia.nome}
                      subtitulo={`Horas totais: ${materia.horasTotais}h`}
                    >
                      <p>{materia.horasConcluidas}h estudadas</p>
                      <div className={style.progress}>
                        <div
                          className={style.progress_bar}
                          style={{
                            width: `${progresso}%`,
                            backgroundColor: "black",
                          }}
                        ></div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {viewingIndex !== null && planoAtivoIndex === viewingIndex ? (
            <>
              <Button
                style={{ backgroundColor: "black", border: 0 }}
                onClick={handleClickLancarHoras}
              >
                Lançar Horas
              </Button>
              <Button
                onClick={handleFecharPlano}
                style={{
                  backgroundColor: "#db3434ff",
                  border: 0,
                }}
              >
                Fechar
              </Button>
            </>
          ) : (
            <>
              <Button
                style={{ backgroundColor: "#000000ff", border: 0 }}
                onClick={() => handleAtivarPlano(viewingIndex)}
              >
                Ativar
              </Button>
              <Button
                onClick={handleFecharPlano}
                style={{
                  backgroundColor: "#db3434ff",
                  border: 0,
                }}
              >
                Fechar
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <Modal
        size="md"
        centered
        show={mostrarLancarHoras}
        onHide={handleFecharLancarHoras}
      >
        <Modal.Header>
          <Modal.Title className={style.modal_titulo}>
            <h4>Lançar Horas</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={style.modal_corpo}>
          <div className={style.formGroup}>
            <label>Matéria:</label>
            <select
              className="form-select"
              value={materiaSelecionada}
              onChange={(e) => setMateriaSelecionada(e.target.value)}
            >
              <option value="">Selecione...</option>
              {planoAtivo.materias.map((m, i) => (
                <option key={i} value={m.nome}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={style.formGroup}>
            <label>Horas estudadas:</label>
            <input
              type="number"
              className="form-control"
              min="1"
              max="24"
              placeholder="Ex: 2"
              value={horasLancar}
              onChange={(e) => setHorasLancar(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{ backgroundColor: "black", border: 0 }}
            onClick={handleConfirmarLancamento}
          >
            Confirmar
          </Button>
          <Button
            onClick={handleFecharLancarHoras}
            style={{ backgroundColor: "#db3434ff", border: 0 }}
          >
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Planos;
