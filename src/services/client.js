import axios from "axios"

export const HTTPClient = axios.create({baseURL: 'http://localhost:5080/api/', headers: {
    'Access-Control-Allow-Origins': '*',
    'Access-Control-Allow-Headers': 'Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATH, DELETE',
    'Content-Type': 'application/json;charset=UTF-8',
}})