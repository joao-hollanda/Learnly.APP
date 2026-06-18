import { HTTPClient } from "./client";

const ChatAPI = {
  async ListarConversas() {
    const resposta = await HTTPClient.get("Chat/conversas");
    return resposta.data;
  },

  async ObterConversa(conversaId) {
    const resposta = await HTTPClient.get(`Chat/conversas/${conversaId}`);
    return resposta.data;
  },

  async ListarMensagens(conversaId, antesDeId, limite = 30) {
    const params = new URLSearchParams();
    if (antesDeId) params.append("antesDeId", antesDeId);
    params.append("limite", limite);

    const resposta = await HTTPClient.get(
      `Chat/conversas/${conversaId}/mensagens?${params.toString()}`,
    );
    return resposta.data;
  },

  async IniciarDireta(amigoId) {
    const resposta = await HTTPClient.post("Chat/direta", { amigoId });
    return resposta.data;
  },

  async MarcarLida(conversaId) {
    const resposta = await HTTPClient.post(`Chat/conversas/${conversaId}/ler`);
    return resposta.data;
  },
};

export default ChatAPI;
