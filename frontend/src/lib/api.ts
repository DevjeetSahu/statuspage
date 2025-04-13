import axios from 'axios';

// const API_BASE = 'http://127.0.0.1:8000';
const API_BASE = import.meta.env.VITE_API_BASE_URL;



export const getServices = () => axios.get(`${API_BASE}/api/services/`);
export const createService = (data: any) => axios.post(`${API_BASE}/api/services/`, data);
export const updateService = (id: number, data: any) => axios.put(`${API_BASE}/api/services/${id}/`, data);
export const deleteService = (id: number) => axios.delete(`${API_BASE}/api/services/${id}/`);


export const getIncidents = () => axios.get(`${API_BASE}/api/incidents/`);
export const createIncident = (data: any) => axios.post(`${API_BASE}/api/incidents/`, data);
export const updateIncident = (id: number, data: any) => axios.put(`${API_BASE}/api/incidents/${id}/`, data);
export const deleteIncident = (id: number) => axios.delete(`${API_BASE}/api/incidents/${id}/`);