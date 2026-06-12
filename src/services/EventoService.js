import { HTTPClient } from "./client";

const EventoEstudoAPI = {
  async Listar() {
    const resposta = await HTTPClient.get(`eventos`);
    return resposta.data;
  },

  async Criar({ titulo, inicio, fim }) {
    const resposta = await HTTPClient.post("eventos", {
      titulo,
      inicio,
      fim,
    });

    return resposta.data;
  },

  async CriarEmLote({ eventos }) {
    const resposta = await HTTPClient.post("eventos/lote", {
      eventos,
    });

    return resposta.data;
  },

  async Remover() {
    await HTTPClient.delete(`eventos`);
  },
};

export default EventoEstudoAPI;
