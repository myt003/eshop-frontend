import { api } from "./api.jsx";
export const categorieService = {
    getAllCategories: async () => {
        return await api.get('/categories');
    }
}