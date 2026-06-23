import style from "./_avatar.module.css";

const iniciais = (nome) => {
  const partes = String(nome || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

const matizDoNome = (nome) => {
  let hash = 0;
  for (let i = 0; i < String(nome).length; i++)
    hash = String(nome).charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
};

const Avatar = ({ nome, foto, size = 40, className = "" }) => {
  const dimensao = { width: size, height: size, fontSize: size * 0.4 };

  if (foto)
    return (
      <img
        src={foto}
        alt={nome || "Foto de perfil"}
        className={`${style.avatar} ${className}`}
        style={dimensao}
      />
    );

  const matiz = matizDoNome(nome);
  return (
    <span
      className={`${style.avatar} ${style.iniciais} ${className}`}
      style={{
        ...dimensao,
        background: `linear-gradient(135deg, hsl(${matiz} 70% 52%), hsl(${(matiz + 35) % 360} 72% 42%))`,
      }}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  );
};

export default Avatar;
