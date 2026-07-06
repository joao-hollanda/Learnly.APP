// Groq costuma emitir LaTeX com \( \) e \[ \] — remark-math só entende $ e $$
export const normalizarMatematica = (texto = "") =>
  texto
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `$$${m}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m}$`);
