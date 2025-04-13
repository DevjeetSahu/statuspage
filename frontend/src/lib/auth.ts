import axios from "axios"

const BASE = import.meta.env.VITE_API_BASE_URL;


export const login = async (username: string, password: string) =>
  axios.post(`${BASE}/api/token/`, { username, password })

export const signup = async (username: string, password: string) =>
  axios.post(`${BASE}/api/register/`, { username, password })

export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token)
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

export const clearAuth = () => {
  localStorage.removeItem("token")
  delete axios.defaults.headers.common["Authorization"]
}

export const getAuthToken = () => localStorage.getItem("token")
