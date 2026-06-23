import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { LuMove } from "react-icons/lu";
import ModalBase from "../Modais/ModalBase";
import style from "./_editorFoto.module.css";

const SAIDA = 256;
const QUALIDADE = 0.85;
const ZOOM_MAX = 3;
const FRACAO_MOLDURA = 0.85;

const limitar = (valor, min, max) => Math.max(min, Math.min(max, valor));

export default function EditorFotoModal({
  aberto,
  src,
  salvando,
  onCancelar,
  onConfirmar,
}) {
  const viewportRef = useRef(null);
  const imgRef = useRef(null);
  const arraste = useRef(null);

  const [v, setV] = useState(300);
  const [dims, setDims] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const d = Math.round(v * FRACAO_MOLDURA);
  const coverScale = dims ? d / Math.min(dims.natW, dims.natH) : 1;
  const scale = coverScale * zoom;
  const dw = dims ? dims.natW * scale : 0;
  const dh = dims ? dims.natH * scale : 0;

  const clampOffset = (off, larguraImg, alturaImg) => ({
    x: limitar(off.x, -(larguraImg - d) / 2, (larguraImg - d) / 2),
    y: limitar(off.y, -(alturaImg - d) / 2, (alturaImg - d) / 2),
  });

  useLayoutEffect(() => {
    const medir = () => {
      if (viewportRef.current) setV(viewportRef.current.offsetWidth);
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [aberto]);

  useEffect(() => {
    if (dims) setOffset((o) => clampOffset(o, dw, dh));
  }, [zoom, dims, v]);

  const aoCarregar = () => {
    const img = imgRef.current;
    if (!img) return;
    setDims({ natW: img.naturalWidth, natH: img.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const aoPressionar = (e) => {
    if (!dims) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arraste.current = {
      px: e.clientX,
      py: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const aoMover = (e) => {
    if (!arraste.current) return;
    const nx = arraste.current.ox + (e.clientX - arraste.current.px);
    const ny = arraste.current.oy + (e.clientY - arraste.current.py);
    setOffset(clampOffset({ x: nx, y: ny }, dw, dh));
  };

  const aoSoltar = (e) => {
    arraste.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const confirmar = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = SAIDA;
    canvas.height = SAIDA;
    const ctx = canvas.getContext("2d");
    const k = SAIDA / d;
    const relX = offset.x - dw / 2 + d / 2;
    const relY = offset.y - dh / 2 + d / 2;
    ctx.drawImage(imgRef.current, relX * k, relY * k, dw * k, dh * k);
    onConfirmar(canvas.toDataURL("image/jpeg", QUALIDADE));
  };

  return (
    <ModalBase
      show={aberto}
      onHide={salvando ? undefined : onCancelar}
      title="Ajustar foto"
      kicker="Foto de perfil"
      backdrop={salvando ? "static" : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onCancelar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={salvando || !dims}>
            {salvando ? <span className={style.spinner} /> : "Salvar foto"}
          </Button>
        </>
      }
    >
      <div className={style.editor}>
        <div
          ref={viewportRef}
          className={style.viewport}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
        >
          {src && (
            <img
              ref={imgRef}
              src={src}
              alt=""
              className={style.imagem}
              draggable={false}
              onLoad={aoCarregar}
              style={
                dims
                  ? {
                      left: v / 2 + offset.x - dw / 2,
                      top: v / 2 + offset.y - dh / 2,
                      width: dw,
                      height: dh,
                    }
                  : { opacity: 0 }
              }
            />
          )}
          <div className={style.mascara} />
        </div>

        <div className={style.controle}>
          <input
            type="range"
            min="1"
            max={ZOOM_MAX}
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom da foto"
            disabled={!dims}
          />
        </div>

        <span className={style.dica}>
          <LuMove /> Arraste para reposicionar · use o controle para dar zoom
        </span>
      </div>
    </ModalBase>
  );
}
