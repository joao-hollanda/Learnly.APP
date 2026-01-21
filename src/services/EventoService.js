import { HTTPClient } from "./client";

const EventoEstudoAPI = {
  async Listar(usuarioId) {
    const resposta = await HTTPClient.get(`eventos/usuario/${usuarioId}`);
    return resposta.data;
  },

  async Criar({ titulo, inicio, fim, usuarioId }) {
    const resposta = await HTTPClient.post("eventos", {
      titulo,
      inicio,
      fim,
      usuarioId,
    });

    return resposta.data;
  },

  async CriarEmLote({ usuarioId, eventos }) {
    const resposta = await HTTPClient.post("eventos/lote", {
      usuarioId,
      eventos,
    });

    return resposta.data;
  },

  async Remover(usuarioId) {
    await HTTPClient.delete(`eventos/${usuarioId}`);
  },
};

export default EventoEstudoAPI;
