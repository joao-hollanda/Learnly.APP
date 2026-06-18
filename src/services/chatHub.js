import * as signalR from "@microsoft/signalr";

const apiBase =
  process.env.REACT_APP_API_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5080/api/"
    : "https://learnly-api-yrdu.onrender.com/api/");

const hubUrl = apiBase.replace(/\/api\/?$/, "") + "/hubs/chat";

let connection = null;
let startPromise = null;

const getConnection = () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }
  return connection;
};

export const iniciarChat = async () => {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) return conn;

  if (!startPromise) {
    startPromise = (async () => {
      try {
        await conn.start();
      } finally {
        startPromise = null;
      }
    })();
  }

  await startPromise;
  return conn;
};

export const pararChat = async () => {
  startPromise = null;
  if (!connection) return;
  const conn = connection;
  connection = null;
  try {
    await conn.stop();
  } catch {
    /* conexão já encerrando */
  }
};

export const enviarMensagemHub = async (
  conversaId,
  { texto = null, tipo = 0, anexoRefId = null, anexoPayload = null } = {},
) => {
  const conn = await iniciarChat();
  await conn.invoke(
    "EnviarMensagem",
    conversaId,
    texto,
    tipo,
    anexoRefId,
    anexoPayload,
  );
};

export const entrarConversaHub = async (conversaId) => {
  const conn = await iniciarChat();
  await conn.invoke("EntrarConversa", conversaId);
};

export const marcarLidaHub = async (conversaId) => {
  const conn = await iniciarChat();
  await conn.invoke("MarcarLida", conversaId);
};

export const onReceberMensagem = (handler) => {
  getConnection().on("ReceberMensagem", handler);
};

export const offReceberMensagem = (handler) => {
  getConnection().off("ReceberMensagem", handler);
};
