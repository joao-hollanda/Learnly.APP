import { HTTPClient } from "./client";

const SimuladoAPI = {
  async GerarSimulado(usuarioId, disciplinas, quantidadeQuestoes) {
    const resposta = await HTTPClient.post(`Simulado/${usuarioId}`, {
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

  async Listar(usuarioId) {
    const resposta = await HTTPClient.get(`Simulado/Listar/${usuarioId}`);

    return resposta.data;
  },
};

export default SimuladoAPI;
