import { HTTPClient } from "./client";

const MentorIAAPI = {
  async EnviarMensagem(corpo, signal) {
    const resposta = await HTTPClient.post("ia/chat", corpo, { signal });
    return resposta.data;
  },
};

export default MentorIAAPI;
