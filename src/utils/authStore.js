import { create } from 'zustand';
import { api } from '../utils/api'


export const useAuthStore = create((set, get) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: true,

    setAccessToken: (token) => {
        set({ accessToken: token, isAuthenticated: !!token })
    },


    fetchUser: async () => {
        try {
            const res = await api.get("auth/me/");
            set({
                user: res.data
            })
        } catch (err) {
            set({
                user: null
            })
        }
    },


    login: async (username, password) => {
        try {
            const res = await api.post("auth/login/", {
                username, password,
            });

            set({
                accessToken: res.data.access,
                isAuthenticated: true,
            });
            await useAuthStore.getState().fetchUser();
            return true;
        } catch (err) {
            return false;
        }
    },

    logout: async () => {
        try {
            await api.post("auth/logout/");
        } catch (err) { }

        set({
            user: null,
            accessToken: null,
            isAuthenticated: false
        })
    },

    refresh: async () => {
        try {
            const res = await api.post("auth/refresh/");
            set({
                accessToken: res.data.access,
                isAuthenticated: true
            });
            await useAuthStore.getState().fetchUser();
        } catch (err) {
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false
            })
        } finally {
            set({
                loading: false
            });
        }
    }

}))