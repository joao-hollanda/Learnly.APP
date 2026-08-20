import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LuArrowLeft, LuArrowRight, LuCheck, LuX } from "react-icons/lu";
import { registrarEvento } from "../../utils/analytics";
import estilo from "./_tour.module.css";

const CHAVE = "learnly:tours";
const MARGEM = 14;
const ESPACO = 16;
const LARGURA = 344;
const TEMPO_MONTAGEM = 1800;
const TEMPO_VISIVEL = 1000;
const LADOS = ["baixo", "cima", "direita", "esquerda"];

const memoria = {};

const vistos = () => {
  try {
    return { ...JSON.parse(localStorage.getItem(CHAVE)), ...memoria };
  } catch {
    return { ...memoria };
  }
};

export const marcarTourVisto = (id) => {
  memoria[id] = true;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(vistos()));
  } catch {
    // Safari em navegação privada lança em setItem; o registro em memória
    // segura o tour até o fim da sessão para não travar quem fechou o balão.
  }
};

export const reiniciarTours = () => {
  Object.keys(memoria).forEach((id) => delete memoria[id]);
  try {
    localStorage.removeItem(CHAVE);
  } catch {}
};

export function useTour(id, pronto) {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    if (!pronto || vistos()[id]) return;
    const timer = setTimeout(() => setAtivo(true), 450);
    return () => clearTimeout(timer);
  }, [id, pronto]);

  const encerrar = useCallback(() => {
    marcarTourVisto(id);
    setAtivo(false);
  }, [id]);

  return { ativo, encerrar };
}

const medir = (elemento, folga) => {
  const r = elemento.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  if (
    r.right <= 0 ||
    r.bottom <= 0 ||
    r.left >= window.innerWidth ||
    r.top >= window.innerHeight
  )
    return null;

  return {
    top: r.top - folga,
    left: r.left - folga,
    width: r.width + folga * 2,
    height: r.height + folga * 2,
  };
};

const elementos = (seletor) => [...document.querySelectorAll(seletor)];

const localizar = (seletor, folga) =>
  elementos(seletor)
    .map((elemento) => medir(elemento, folga))
    .find(Boolean) ?? null;

const mesmoRect = (a, b) =>
  !!a &&
  !!b &&
  Math.abs(a.top - b.top) < 1 &&
  Math.abs(a.left - b.left) < 1 &&
  Math.abs(a.width - b.width) < 1 &&
  Math.abs(a.height - b.height) < 1;

const cabe = (lado, alvo, altura, largura, vw, vh) => {
  if (lado === "baixo")
    return alvo.top + alvo.height + ESPACO + altura <= vh - MARGEM;
  if (lado === "cima") return alvo.top - ESPACO - altura >= MARGEM;
  if (lado === "direita")
    return alvo.left + alvo.width + ESPACO + largura <= vw - MARGEM;
  return alvo.left - ESPACO - largura >= MARGEM;
};

const calcular = (alvo, altura, ladoPreferido) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const largura = Math.min(LARGURA, vw - MARGEM * 2);
  const limitar = (v, max) => Math.max(MARGEM, Math.min(v, max - MARGEM));

  if (!alvo)
    return {
      lado: "centro",
      top: Math.max(MARGEM, (vh - altura) / 2),
      left: (vw - largura) / 2,
      seta: null,
    };

  const ordem = [ladoPreferido, ...LADOS].filter(
    (l, i, arr) => l && arr.indexOf(l) === i,
  );
  const lado =
    ordem.find((l) => cabe(l, alvo, altura, largura, vw, vh)) ?? "baixo";

  const centroX = alvo.left + alvo.width / 2;
  const centroY = alvo.top + alvo.height / 2;

  if (lado === "baixo" || lado === "cima") {
    const left = limitar(centroX - largura / 2, vw - largura);
    const top =
      lado === "baixo"
        ? alvo.top + alvo.height + ESPACO
        : alvo.top - ESPACO - altura;
    return {
      lado,
      left,
      top: limitar(top, vh - altura),
      seta: Math.max(22, Math.min(centroX - left, largura - 22)),
    };
  }

  const top = limitar(centroY - altura / 2, vh - altura);
  const left =
    lado === "direita"
      ? alvo.left + alvo.width + ESPACO
      : alvo.left - ESPACO - largura;
  return {
    lado,
    top,
    left: limitar(left, vw - largura),
    seta: Math.max(22, Math.min(centroY - top, altura - 22)),
  };
};

export default function Tour({ id, passos, ativo, aoEncerrar }) {
  const [indice, setIndice] = useState(0);
  const [alvo, setAlvo] = useState(null);
  const [posicao, setPosicao] = useState(null);
  const balaoRef = useRef(null);
  const buscaRef = useRef(0);
  const passosRef = useRef(passos);
  passosRef.current = passos;

  const passo = ativo ? passos[indice] : null;
  const ultimo = indice === passos.length - 1;

  const encerrar = useCallback(
    (motivo) => {
      registrarEvento(motivo === "fim" ? "tour_concluido" : "tour_pulado", {
        tour: id,
        passo: indice + 1,
      });
      aoEncerrar();
    },
    [aoEncerrar, id, indice],
  );

  const avancar = useCallback(() => {
    if (indice >= passosRef.current.length - 1) return encerrar("fim");
    setIndice(indice + 1);
  }, [encerrar, indice]);

  useEffect(() => {
    if (!ativo) setIndice(0);
  }, [ativo]);

  useEffect(() => {
    buscaRef.current = Date.now();
    if (!passosRef.current[indice]?.alvo) setAlvo(null);
  }, [indice, ativo]);

  useEffect(() => {
    if (!ativo) return;
    const seletor = passosRef.current[indice]?.alvo;
    if (!seletor) return;

    const folga = passosRef.current[indice].folga ?? 8;
    let frame;

    const procurar = () => {
      frame = requestAnimationFrame(procurar);

      const rect = localizar(seletor, folga);
      if (rect)
        return setAlvo((atual) => (mesmoRect(atual, rect) ? atual : rect));

      const limite = elementos(seletor).length ? TEMPO_VISIVEL : TEMPO_MONTAGEM;
      if (Date.now() - buscaRef.current > limite) {
        cancelAnimationFrame(frame);
        avancar();
      }
    };

    frame = requestAnimationFrame(procurar);
    return () => cancelAnimationFrame(frame);
  }, [ativo, indice, avancar]);

  useEffect(() => {
    if (!ativo) return;
    const seletor = passosRef.current[indice]?.alvo;
    if (!seletor) return;
    elementos(seletor)[0]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [ativo, indice]);

  useEffect(() => {
    if (!ativo) return;
    const aoTeclar = (e) => e.key === "Escape" && encerrar("escape");
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [ativo, encerrar]);

  useLayoutEffect(() => {
    const atual = ativo ? passosRef.current[indice] : null;
    if (!atual) return;
    if (atual.alvo && !alvo) return;

    const altura = balaoRef.current?.offsetHeight ?? 220;
    const nova = calcular(atual.alvo ? alvo : null, altura, atual.lado);

    setPosicao((anterior) =>
      anterior &&
      anterior.lado === nova.lado &&
      anterior.seta === nova.seta &&
      Math.abs(anterior.top - nova.top) < 1 &&
      Math.abs(anterior.left - nova.left) < 1
        ? anterior
        : nova,
    );
  }, [ativo, indice, alvo]);

  if (!ativo || !passo) return null;

  const acaoPrincipal = () => {
    passo.acao?.executar();
    avancar();
  };

  const raio = passo.raio ?? 14;
  const geometria = alvo && {
    top: alvo.top,
    left: alvo.left,
    width: alvo.width,
    height: alvo.height,
    borderRadius: raio,
  };

  const blocos = alvo
    ? [
        { top: 0, left: 0, right: 0, height: Math.max(0, alvo.top) },
        { top: alvo.top + alvo.height, left: 0, right: 0, bottom: 0 },
        {
          top: alvo.top,
          left: 0,
          width: Math.max(0, alvo.left),
          height: alvo.height,
        },
        {
          top: alvo.top,
          left: alvo.left + alvo.width,
          right: 0,
          height: alvo.height,
        },
      ]
    : [{ inset: 0 }];

  return createPortal(
    <div
      className={estilo.camada}
      style={passo.tinta ? { "--tinta": passo.tinta } : undefined}
    >
      {blocos.map((bloco, i) => (
        <div
          key={i}
          className={`${estilo.bloqueio} ${alvo ? "" : estilo.veu}`}
          style={bloco}
        />
      ))}

      {alvo && (
        <>
          <div className={estilo.recorte} style={geometria} />
          <div className={estilo.pulso} style={geometria} />
        </>
      )}

      <div
        ref={balaoRef}
        className={estilo.balao}
        role="dialog"
        aria-label="Tutorial"
        data-lado={posicao?.lado ?? "centro"}
        style={{
          top: posicao?.top ?? -9999,
          left: posicao?.left ?? -9999,
          opacity: posicao ? 1 : 0,
          "--seta": posicao?.seta ? `${posicao.seta}px` : "50%",
        }}
      >
        <div className={estilo.topo}>
          <span className={estilo.contador}>
            Passo {String(indice + 1).padStart(2, "0")} —{" "}
            {String(passos.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            className={estilo.fechar}
            onClick={() => encerrar("fechar")}
            aria-label="Fechar tutorial"
          >
            <LuX />
          </button>
        </div>

        <h3 className={estilo.titulo}>{passo.titulo}</h3>
        <p className={estilo.texto}>{passo.texto}</p>

        <div className={estilo.trilha}>
          {passos.map((_, i) => (
            <span
              key={i}
              className={`${estilo.marca} ${i <= indice ? estilo.marcaAtiva : ""}`}
            />
          ))}
        </div>

        <div className={estilo.acoes}>
          <button
            type="button"
            className={estilo.pular}
            onClick={() => encerrar("pular")}
          >
            Pular tutorial
          </button>

          <div className={estilo.acoesDireita}>
            {indice > 0 && !passo.semVoltar && (
              <button
                type="button"
                className={estilo.voltar}
                onClick={() => setIndice(indice - 1)}
                aria-label="Voltar"
              >
                <LuArrowLeft />
              </button>
            )}
            <button
              type="button"
              className={estilo.avancar}
              onClick={acaoPrincipal}
            >
              {passo.acao?.texto ?? (ultimo ? "Entendi" : "Próximo")}
              {ultimo && !passo.acao ? <LuCheck /> : <LuArrowRight />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
