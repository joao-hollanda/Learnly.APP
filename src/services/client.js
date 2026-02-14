import axios from "axios"

const local = 'http://localhost:5080/api/'
const deploy = 'https://learnly-api-yrdu.onrender.com/api/'

export const HTTPClient = axios.create({baseURL: deploy, headers: {
    'Access-Control-Allow-Origins': '*',
    'Access-Control-Allow-Headers': 'Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATH, DELETE',
    'Content-Type': 'application/json;charset=UTF-8',
}})