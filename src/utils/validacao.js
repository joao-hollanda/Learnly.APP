export const REGRA_SENHA_MSG =
  "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número, caractere especial e sem espaços.";

export const emailValido = (valor) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).toLowerCase());

export const senhaValida = (valor) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])([^\s]){8,}$/.test(
    String(valor),
  );
