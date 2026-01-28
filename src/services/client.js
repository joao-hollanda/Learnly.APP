import axios from "axios"

export const HTTPClient = axios.create({baseURL: 'https://learnly-api-yrdu.onrender.com/api/', headers: {
    'Access-Control-Allow-Origins': '*',
    'Access-Control-Allow-Headers': 'Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATH, DELETE',
    'Content-Type': 'application/json;charset=UTF-8',
}})