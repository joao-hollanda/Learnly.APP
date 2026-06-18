import { HTTPClient } from "./client";

const AmizadeAPI = {
  async ListarAmigos() {
    const resposta = await HTTPClient.get("Amizade");
    return resposta.data;
  },

  async ListarPendentes() {
    const resposta = await HTTPClient.get("Amizade/pendentes");
    return resposta.data;
  },

  async ListarEnviadas() {
    const resposta = await HTTPClient.get("Amizade/enviadas");
    return resposta.data;
  },

  async Solicitar(emailOuNome) {
    const resposta = await HTTPClient.post("Amizade/solicitar", { emailOuNome });
    return resposta.data;
  },

  async Aceitar(amizadeId) {
    const resposta = await HTTPClient.post(`Amizade/${amizadeId}/aceitar`);
    return resposta.data;
  },

  async Recusar(amizadeId) {
    const resposta = await HTTPClient.post(`Amizade/${amizadeId}/recusar`);
    return resposta.data;
  },

  async Remover(amizadeId) {
    const resposta = await HTTPClient.delete(`Amizade/${amizadeId}`);
    return resposta.data;
  },
};

export default AmizadeAPI;
