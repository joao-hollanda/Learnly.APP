import { HTTPClient } from "./client";

const LoginAPI = {
    async Login(email, senha) {
        const resposta = await HTTPClient.post(`Login`, {
            email: email,
            senha: senha
        });

        return resposta.data;
    },

    async Register(usuario, email, senha) {
        const resposta = await HTTPClient.post(`Usuarios/Criar`, {
            nome: usuario,
            email: email,
            senha: senha,
            cidade: ""
        });

        return resposta.data;
    },

    async Awake() {
        const resposta = await HTTPClient.get(`Login/warmup`);

        return resposta.data;
    },

    async Logout() {
        const resposta = await HTTPClient.post(`Login/logout`);
        
        return resposta.data;
    },

    async RefreshToken() {
        const resposta = await HTTPClient.post(`Login/refresh`);

        return resposta.data;
    },

    async ConfirmarEmail(token) {
        const resposta = await HTTPClient.post(`Login/confirmar-email`, { token });

        return resposta.data;
    },

    async ReenviarConfirmacao(email) {
        const resposta = await HTTPClient.post(`Login/reenviar-confirmacao`, { email });

        return resposta.data;
    },

    async EsqueciSenha(email) {
        const resposta = await HTTPClient.post(`Login/esqueci-senha`, { email });

        return resposta.data;
    },

    async RedefinirSenha(token, senha) {
        const resposta = await HTTPClient.post(`Login/redefinir-senha`, { token, senha });

        return resposta.data;
    }
};

export default LoginAPI