import { useState } from "react";
import { Button } from "react-bootstrap";
import {
  BsShare,
  BsClipboard,
  BsClipboardCheck,
  BsPeople,
} from "react-icons/bs";
import { toast } from "react-toastify";
import ModalBase from "../ModalBase";
import style from "./_compartilhamento.module.css";

function ModalCompartilharPlano({ show, onHide, chave, onVerGrupo }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(chave ?? "");
      setCopiado(true);
      toast.success("Chave copiada!");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não foi possível copiar a chave.");
    }
  };

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Compartilhar plano"
      subtitle="Envie esta chave aos seus amigos. Cada um recebe uma cópia e acompanha o próprio progresso."
      kicker="Compartilhamento"
      iconType="success"
      icon={<BsShare />}
      footer={
        <>
          {onVerGrupo && (
            <Button variant="secondary" onClick={onVerGrupo}>
              <BsPeople /> Ver grupo
            </Button>
          )}
          <Button variant="primary" onClick={onHide}>
            Concluir
          </Button>
        </>
      }
    >
      <div className={style.chaveBox}>
        <span className={style.chaveValor}>{chave}</span>
        <button type="button" className={style.copiarBtn} onClick={copiar}>
          {copiado ? <BsClipboardCheck /> : <BsClipboard />}
          {copiado ? "Copiado" : "Copiar"}
        </button>
      </div>
      <small className={style.dica}>
        Quem tiver a chave resgata o plano em <strong>Planos → Resgatar</strong>.
        Você pode acompanhar o progresso de todos em <strong>Ver grupo</strong>.
      </small>
    </ModalBase>
  );
}

export default ModalCompartilharPlano;
