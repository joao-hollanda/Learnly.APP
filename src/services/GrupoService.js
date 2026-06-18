import { HTTPClient } from "./client";

const GrupoAPI = {
  async ListarMeus() {
    const resposta = await HTTPClient.get("Grupo");
    return resposta.data;
  },

  async Obter(grupoId) {
    const resposta = await HTTPClient.get(`Grupo/${grupoId}`);
    return resposta.data;
  },

  async Criar(nome, descricao) {
    const resposta = await HTTPClient.post("Grupo", { nome, descricao });
    return resposta.data;
  },

  async Entrar(chave) {
    const resposta = await HTTPClient.post("Grupo/entrar", { chave });
    return resposta.data;
  },

  async Sair(grupoId) {
    const resposta = await HTTPClient.post(`Grupo/${grupoId}/sair`);
    return resposta.data;
  },
};

export default GrupoAPI;
