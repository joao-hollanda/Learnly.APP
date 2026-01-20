import { HTTPClient } from "./client";

const PlanoAPI = {
  async Criar(plano) {
    const resposta = await HTTPClient.post("Plano", plano);
    return resposta.data;
  },

  async Obter(planoId) {
    const resposta = await HTTPClient.get(`Plano/${planoId}`);
    return resposta.data;
  },

  async Listar5(usuarioId) {
    const resposta = await HTTPClient.get(`Plano/usuario/${usuarioId}`);
    return resposta.data;
  },

  async Atualizar(plano) {
    const resposta = await HTTPClient.put("Plano", plano);
    return resposta.data;
  },

  async AtivarPlano(planoId, usuarioId) {
    const resposta = await HTTPClient.put(
      `Plano/${planoId}/ativar?usuarioId=${usuarioId}`,
    );
    return resposta.data;
  },

  async ListarMaterias() {
    const resposta = await HTTPClient.get("Materia");
    return resposta.data;
  },

  async AdicionarMateria(planoId, dados) {
    const resposta = await HTTPClient.post(`Plano/${planoId}/materia`, dados);
    return resposta.data;
  },

  async LancarHoras(planoMateriaId, horas) {
    const resposta = await HTTPClient.put(
      `Plano/lancar-horas?planoMateriaId=${planoMateriaId}&horas=${horas}`,
    );
    return resposta.data;
  },

  async ObterResumo(usuarioId) {
    const resposta = await HTTPClient.get(`Plano/gerar-resumo/${usuarioId}`);
    return resposta.data;
  },

  async CompararHoras(usuarioId) {
    const resposta = await HTTPClient.get(
      `Plano/horas/comparacao/${usuarioId}`,
    );
    return resposta.data;
  },
};

export default PlanoAPI;
