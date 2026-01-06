import { HTTPClient } from "./client";

const LoginAPI = {
    async Login(email, senha) {
        const resposta = await HTTPClient.post(`Login`, {
            email: email,
            senha: senha
        });

        return resposta;
    },

    async Register(usuario, email, senha) {
        const resposta = await HTTPClient.post(`Usuarios/Criar`, {
            nome: usuario,
            email: email,
            senha: senha,
            cidade: ""
        });

        return resposta;
    },
};

export default LoginAPI