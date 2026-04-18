import { Modal } from "react-bootstrap";

export default function ModalBase({
  show,
  onHide,
  title,
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
      <Modal.Header closeButton={false} style={{ position: "relative", flexDirection: "column", alignItems: "center" }}>
        {headerAction && (
          <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", alignItems: "center" }}>
            {headerAction}
          </div>
        )}
        {onHide && (
          <button
            type="button"
            className="btn-close"
            onClick={onHide}
            aria-label="Close"
            style={{ position: "absolute", top: "0.75rem", right: "0.75rem" }}
          />
        )}
        {icon && <div className={`modal-icon modal-icon-${iconType}`}>{icon}</div>}
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      {footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  );
}
