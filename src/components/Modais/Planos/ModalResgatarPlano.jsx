import { Button } from "react-bootstrap";
import { BsBoxArrowInDown, BsKey } from "react-icons/bs";
import ModalBase from "../ModalBase";
import modalStyle from "../_modal.module.css";
import style from "./_compartilhamento.module.css";

function ModalResgatarPlano({ show, onHide, chave, setChave, onResgatar, loading }) {
  const podeResgatar = !loading && chave?.trim();

  return (
    <ModalBase
      show={show}
      onHide={onHide}
      title="Resgatar plano"
      subtitle="Cole a chave que um amigo compartilhou para receber uma cópia do plano."
      kicker="Compartilhamento"
      iconType="info"
      icon={<BsBoxArrowInDown />}
      footer={
        <>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onResgatar} disabled={!podeResgatar}>
            {loading ? (
              <span className={modalStyle.spinner} />
            ) : (
              <>
                <BsBoxArrowInDown /> Resgatar
              </>
            )}
          </Button>
        </>
      }
    >
      <label className={style.campoLabel}>
        <BsKey /> Chave de compartilhamento
      </label>
      <input
        className={style.chaveInput}
        type="text"
        value={chave}
        onChange={(e) => setChave(e.target.value.toUpperCase())}
        onKeyDown={(e) => {
          if (e.key === "Enter" && podeResgatar) onResgatar();
        }}
        placeholder="Ex.: ABCD2345"
        maxLength={12}
        autoFocus
      />
    </ModalBase>
  );
}

export default ModalResgatarPlano;
