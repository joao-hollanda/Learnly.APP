import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { FaPlus, FaTrash, FaExchangeAlt, FaClock, FaCheck } from "react-icons/fa";
import { BsSearch, BsSend } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import PlanoAPI from "../../../services/PlanoService";
import ModalBase from "../ModalBase";
import style from "../_modal.module.css";

const PRESETS_CARGA = [10, 15, 20, 30, 40];

const CONFIG = {
  adicionar: {
    titulo: "Adicionar matéria",
    subtitulo: "O Mentor adiciona a matéria ao seu plano ativo",
    icon: <FaPlus />,
    iconType: "success",
  },
  remover: {
    titulo: "Remover matéria",
    subtitulo: "O Mentor remove a matéria do seu plano ativo",
    icon: <FaTrash />,
    iconType: "danger",
  },
  substituir: {
    titulo: "Substituir matéria",
    subtitulo: "O Mentor troca uma matéria do plano por outra",
    icon: <FaExchangeAlt />,
    iconType: "info",
  },
  carga: {
    titulo: "Ajustar carga horária",
    subtitulo: "O Mentor reajusta suas horas semanais de estudo",
    icon: <FaClock />,
    iconType: "info",
  },
};

const normalizar = (s) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function PickerMaterias({ opcoes, valor, onTrocar, vazio }) {
  return (
    <div className={style.pickerGrid}>
      {opcoes.length === 0 ? (
        <p className={style.pickerVazio}>{vazio}</p>
      ) : (
        opcoes.map((m) => {
          const ativa = m.materiaId === valor;
          return (
            <button
              key={m.materiaId}
              type="button"
              className={`${style.pickerTile} ${ativa ? style.pickerTileAtivo : ""}`}
              onClick={() => onTrocar(ativa ? "" : m.materiaId)}
            >
              <span
                className={style.pickerDot}
                style={{ backgroundColor: m.cor || "var(--brand)" }}
              />
              <span className={style.pickerNome}>{m.nome}</span>
              <span className={style.pickerCheck}>
                <FaCheck />
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}

function ModalAcaoMentor({ show, acao, onHide, onEnviar }) {
  const [materiaSel, setMateriaSel] = useState("");
  const [materiaSai, setMateriaSai] = useState("");
  const [materiaEntra, setMateriaEntra] = useState("");
  const [horas, setHoras] = useState("");
  const [busca, setBusca] = useState("");

  const { data: materiasDisponiveis = [] } = useQuery({
    queryKey: ["materias"],
    queryFn: PlanoAPI.ListarMaterias,
    staleTime: Infinity,
    enabled: show,
  });

  const { data: planoAtivo } = useQuery({
    queryKey: ["planoAtivo"],
    queryFn: () => PlanoAPI.ObterPlanoAtivo(),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: show,
  });

  useEffect(() => {
    if (show) {
      setMateriaSel("");
      setMateriaSai("");
      setMateriaEntra("");
      setHoras("");
      setBusca("");
    }
  }, [show, acao]);

  if (!acao) return null;
  const cfg = CONFIG[acao];

  const materiasPlano = planoAtivo?.materias ?? [];
  const foraDoPlano = materiasDisponiveis.filter(
    (m) => !materiasPlano.some((pm) => pm.materiaId === m.materiaId)
  );
  const foraFiltradas = foraDoPlano.filter((m) =>
    normalizar(m.nome).includes(normalizar(busca))
  );

  const nomeEm = (lista, id) => lista.find((m) => m.materiaId === id)?.nome;

  let pronto = false;
  let mensagem = "";
  if (acao === "adicionar") {
    pronto = !!materiaSel;
    mensagem = `Adiciona ${nomeEm(foraDoPlano, materiaSel)} no meu plano`;
  } else if (acao === "remover") {
    pronto = !!materiaSel;
    mensagem = `Remove ${nomeEm(materiasPlano, materiaSel)} do meu plano`;
  } else if (acao === "substituir") {
    pronto = !!materiaSai && !!materiaEntra;
    mensagem = `Substitui ${nomeEm(materiasPlano, materiaSai)} por ${nomeEm(foraDoPlano, materiaEntra)} no meu plano`;
  } else {
    pronto = !!horas;
    mensagem = `Ajusta minha carga horária para ${horas}h por semana`;
  }

  const buscaCampo = (
    <div className={style.buscaWrap}>
      <BsSearch className={style.buscaIcone} />
      <input
        className={`form-control ${style.buscaInput}`}
        placeholder="Buscar matéria..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
    </div>
  );

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title={cfg.titulo}
      subtitle={cfg.subtitulo}
      kicker="Mentor · Ação"
      iconType={cfg.iconType}
      icon={cfg.icon}
      footer={
        <>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => onEnviar(mensagem)}
            disabled={!pronto}
          >
            <BsSend /> Enviar ao Mentor
          </Button>
        </>
      }
    >
      {acao === "adicionar" && (
        <div className={style.campo}>
          <div className={style.labelLinha}>
            <span className={style.label}>Matéria</span>
            <span className={style.contador}>
              {foraFiltradas.length} disponíve{foraFiltradas.length === 1 ? "l" : "is"}
            </span>
          </div>
          {buscaCampo}
          <PickerMaterias
            opcoes={foraFiltradas}
            valor={materiaSel}
            onTrocar={setMateriaSel}
            vazio={`Nenhuma matéria encontrada para "${busca}".`}
          />
        </div>
      )}

      {acao === "remover" && (
        <div className={style.campo}>
          <span className={style.label}>Matéria do plano</span>
          <PickerMaterias
            opcoes={materiasPlano}
            valor={materiaSel}
            onTrocar={setMateriaSel}
            vazio="Seu plano ativo não tem matérias."
          />
        </div>
      )}

      {acao === "substituir" && (
        <>
          <div className={style.campo}>
            <span className={style.label}>Sai do plano</span>
            <PickerMaterias
              opcoes={materiasPlano}
              valor={materiaSai}
              onTrocar={setMateriaSai}
              vazio="Seu plano ativo não tem matérias."
            />
          </div>
          <div className={style.campo}>
            <span className={style.label}>Entra no lugar</span>
            {buscaCampo}
            <PickerMaterias
              opcoes={foraFiltradas}
              valor={materiaEntra}
              onTrocar={setMateriaEntra}
              vazio={`Nenhuma matéria encontrada para "${busca}".`}
            />
          </div>
        </>
      )}

      {acao === "carga" && (
        <div className={style.campo}>
          <span className={style.label}>Nova carga semanal</span>
          <div className={style.chips}>
            {PRESETS_CARGA.map((h) => (
              <button
                key={h}
                type="button"
                className={`${style.chip} ${horas === h ? style.chipAtivo : ""}`}
                onClick={() => setHoras(h)}
              >
                {h}h
              </button>
            ))}
          </div>
          <input
            type="number"
            className="form-control"
            value={horas}
            placeholder="Ou digite as horas por semana (máx: 60)"
            min={1}
            max={60}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return setHoras("");
              if (+v < 1 || +v > 60) return;
              setHoras(+v);
            }}
          />
        </div>
      )}

      {pronto && (
        <div className={style.resumoSelecao}>
          "{mensagem}"
          <span className={style.resumoHoras}>será enviado</span>
        </div>
      )}
    </ModalBase>
  );
}

export default ModalAcaoMentor;
