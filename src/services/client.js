import axios from "axios"

const local = 'http://localhost:5080/api/'
const deploy = 'https://learnly-api-yrdu.onrender.com/api/'

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

export const HTTPClient = axios.create({
    baseURL: deploy, 
    withCredentials: true,
    headers: {
        'Access-Control-Allow-Origins': '*',
        'Access-Control-Allow-Headers': 'Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATH, DELETE',
        'Content-Type': 'application/json;charset=UTF-8',
    }
})

HTTPClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest._skipAuthRefresh) {
            return Promise.reject(error);
        }

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return HTTPClient(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshConfig = {
                    url: "Login/refresh",
                    method: "post",
                    _skipAuthRefresh: true 
                 };
                await HTTPClient.request(refreshConfig);
                processQueue(null, null);
                isRefreshing = false;
                
                originalRequest._retry = false;
                return HTTPClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                
                sessionStorage.removeItem("id");
                sessionStorage.removeItem("nome");
                
                if (window.location.pathname !== "/" && window.location.pathname !== "/login") {
                    window.location.href = "/";
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
)