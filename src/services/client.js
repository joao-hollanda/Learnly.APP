import axios from "axios"

export const HTTPClient = axios.create({baseURL: 'http://localhost:5080/api/', headers: {
    'Access-Controll-Allow-Origins': '*',
    'Access-Controll-Allow-Headers': 'Authorization',
    'Access-Controll-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATH, DELETE',
    'Content-Type': 'application/json;charset=UTF-8',
}})