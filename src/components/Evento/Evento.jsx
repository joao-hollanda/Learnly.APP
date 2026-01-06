import styles from "./_evento.module.css";

const Event = ({ titulo, horario, status }) => {
  let statusClass = "";

  if (status === "concluido") statusClass = styles.concluido;
  if (status === "atual") statusClass = styles.atual;
  if (status === "proximo") statusClass = styles.proximo;

  return (
    <div className={`${styles.event} ${statusClass}`}>
      <strong>{titulo}</strong>
      <span>{horario}</span>
    </div>
  );
};

export default Event;
