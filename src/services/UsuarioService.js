import { HTTPClient } from "./client";

const UsuarioAPI = {
  async Atualizar({ nome, email }) {
    const resposta = await HTTPClient.put("Usuarios", { nome, email });
    return resposta.data;
  },

  async AtualizarFoto(foto) {
    const resposta = await HTTPClient.put("Usuarios/Foto", { foto });
    return resposta.data;
  },

  async AtualizarSenha(senhaAntiga, senha) {
    const resposta = await HTTPClient.put("Usuarios/Senha", {
      senhaAntiga,
      senha,
    });
    return resposta.data;
  },

  async Desativar(usuarioId) {
    const resposta = await HTTPClient.delete(`Usuarios/Desativar/${usuarioId}`);
    return resposta.data;
  },
};

export default UsuarioAPI;
