import posthog from "posthog-js";

const KEY = process.env.REACT_APP_POSTHOG_KEY;
const HOST = process.env.REACT_APP_POSTHOG_HOST || "https://us.i.posthog.com";

let ativo = false;

const dev = process.env.NODE_ENV === "development";

export function iniciarAnalytics() {
  if (ativo) return;
  if (!KEY) {
    if (dev)
      console.info(
        "[analytics] PostHog desativado — REACT_APP_POSTHOG_KEY não carregada. " +
          "O CRA só lê o .env no start: reinicie o npm start.",
      );
    return;
  }
  posthog.init(KEY, {
    // em produção os eventos saem por /ingest (rewrite no vercel.json),
    // que adblockers não bloqueiam por ser o domínio do próprio site
    api_host: dev ? HOST : "/ingest",
    ui_host: "https://us.posthog.com",
    capture_pageview: false,
    autocapture: false,
    persistence: "localStorage+cookie",
    loaded: (ph) => {
      if (dev) ph.debug();
    },
  });
  ativo = true;
}

export function identificarUsuario(id, propriedades) {
  if (ativo && id) posthog.identify(String(id), propriedades);
}

export function limparIdentidade() {
  if (ativo) posthog.reset();
}

export function registrarEvento(nome, propriedades) {
  if (ativo) posthog.capture(nome, propriedades);
}

export function registrarPageview(rota) {
  if (ativo) posthog.capture("$pageview", { rota });
}
