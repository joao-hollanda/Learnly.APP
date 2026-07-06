import { registrarEvento } from "../../../utils/analytics";
import style from "../../../Pages/simulados/_simulados.module.css";

export default function MateriaisRecomendados({ materiais }) {
  if (!materiais?.length) return null;

  return (
    <div className={style.materiaisBox}>
      <h5>Materiais para revisar</h5>
      <div className={style.materiaisGrid}>
        {materiais.map((m, idx) => {
          const termo = encodeURIComponent(m.termoBusca || m.titulo);
          const fallback =
            m.plataforma === "youtube"
              ? `https://www.youtube.com/results?search_query=${termo}`
              : `https://www.google.com/search?q=${termo}`;
          const link = m.url || fallback;
          return (
            <a
              key={idx}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={style.materialCard}
              onClick={() =>
                registrarEvento("material_clicado", {
                  titulo: m.titulo,
                  area: m.area,
                  plataforma: m.plataforma,
                })
              }
            >
              <div className={style.materialTopo}>
                {m.tipo && <span className={style.materialTipo}>{m.tipo}</span>}
                {m.area && <span className={style.materialArea}>{m.area}</span>}
              </div>
              <span className={style.materialTitulo}>{m.titulo}</span>
              {m.motivo && (
                <span className={style.materialMotivo}>{m.motivo}</span>
              )}
              <span className={style.materialLink}>
                {m.plataforma === "youtube"
                  ? "Assistir no YouTube"
                  : "Abrir material"}{" "}
                →
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
