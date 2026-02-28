import { api } from "./api";



export const createWebsite = async (data) => {
    const res = await api.post("website/", data);
    return res.data;
}

export const fetchWebsite = async () => {
    const res = await api.get("website/");
    return res.data;
}

export const fetchWebsiteId = async (id) => {
    const res = await api.get(`website/${id}/`);    
    return res.data;
}