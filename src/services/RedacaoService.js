import { HTTPClient } from "./client";

const RedacaoAPI = {
  async Transcrever(imagem) {
    const formData = new FormData();
    formData.append("imagem", imagem);

    const resposta = await HTTPClient.post("Redacao/Transcrever", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return resposta.data;
  },

  async GerarTema() {
    const resposta = await HTTPClient.get("Redacao/Tema");

    return resposta.data;
  },

  async Corrigir(tema, texto) {
    const resposta = await HTTPClient.post("Redacao", { tema, texto });

    return resposta.data;
  },

  async Listar() {
    const resposta = await HTTPClient.get("Redacao");

    return resposta.data;
  },

  async Obter(redacaoId) {
    const resposta = await HTTPClient.get(`Redacao/${redacaoId}`);

    return resposta.data;
  },
};

export default RedacaoAPI;
