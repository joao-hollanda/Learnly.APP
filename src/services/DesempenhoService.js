import { HTTPClient } from "./client";

const DesempenhoAPI = {
  async ObterDashboard() {
    const resposta = await HTTPClient.get("Desempenho/dashboard");
    return resposta.data;
  },
};

export default DesempenhoAPI;
