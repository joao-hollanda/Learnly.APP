import { HTTPClient } from "./client";

const SimuladoAPI = {
  async GerarSimulado( disciplinas, quantidadeQuestoes) {
    const resposta = await HTTPClient.post(`Simulado`, {
      disciplinas,
      quantidadeQuestoes,
    });

    return resposta.data;
  },

  async Responder(simuladoId, respostas) {
    const resposta = await HTTPClient.put(
      `Simulado/Responder/${simuladoId}`,
      respostas
    );

    return resposta.data;
  },

  async Obter(simuladoId) {
    const resposta = await HTTPClient.get(`Simulado/${simuladoId}`);

    return resposta.data;
  },

  async Listar() {
    const resposta = await HTTPClient.get(`Simulado/Listar`);

    return resposta.data;
  },

  async Contar () {
    const resposta = await HTTPClient.get(`Simulado/Contar`);

    return resposta.data
  }
};

export default SimuladoAPI;
