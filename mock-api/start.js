const { spawn } = require("child_process");
const path = require("path");

const PORTA_MOCK = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 5099;
const PORTA_APP = process.env.PORT ? Number(process.env.PORT) : 3001;
const raiz = path.join(__dirname, "..");

const mock = spawn(process.execPath, [path.join(__dirname, "server.js")], {
  stdio: "inherit",
  env: { ...process.env, PORT: String(PORTA_MOCK), APP_PORT: String(PORTA_APP) },
});

const app = spawn("npm", ["start"], {
  cwd: raiz,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PORT: String(PORTA_APP),
    REACT_APP_API_URL: `http://localhost:${PORTA_MOCK}/api/`,
    REACT_APP_POSTHOG_KEY: "",
    BROWSER: "none",
  },
});

const encerrar = () => {
  mock.kill();
  app.kill();
  process.exit(0);
};

process.on("SIGINT", encerrar);
process.on("SIGTERM", encerrar);
app.on("exit", encerrar);
