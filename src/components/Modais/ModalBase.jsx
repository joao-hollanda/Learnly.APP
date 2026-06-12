import { Modal } from "react-bootstrap";
import { IoClose } from "react-icons/io5";

const KICKER_PADRAO = {
  info: "Learnly",
  success: "Tudo certo",
  danger: "Atenção",
  warning: "Confirmação",
};

export default function ModalBase({
  show,
  onHide,
  title,
  subtitle,
  kicker,
  icon,
  iconType = "info",
  children,
  footer,
  headerAction,
  size,
  backdrop,
  keyboard,
  scrollable,
}) {
  return (
    <Modal
      show={show}
      centered
      onHide={onHide}
      size={size}
      backdrop={backdrop}
      keyboard={keyboard}
      scrollable={scrollable}
    >
      <div className={`ly-modal-header ly-modal-header-${iconType}`}>
        {icon && (
          <span className={`ly-modal-icon ly-modal-icon-${iconType}`}>
            {icon}
          </span>
        )}
        <div className="ly-modal-heading">
          <span className="ly-modal-kicker">
            {kicker ?? KICKER_PADRAO[iconType] ?? "Learnly"}
          </span>
          <h2 className="ly-modal-title">{title}</h2>
          {subtitle && <p className="ly-modal-subtitle">{subtitle}</p>}
        </div>
        {headerAction}
        {onHide && (
          <button
            type="button"
            className="ly-modal-close"
            onClick={onHide}
            aria-label="Fechar"
          >
            <IoClose />
          </button>
        )}
      </div>

      <Modal.Body>{children}</Modal.Body>

      {footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  );
}
