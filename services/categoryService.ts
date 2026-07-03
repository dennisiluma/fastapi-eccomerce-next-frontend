import { API_CONFIG } from './apiUrl';

const API_BASE_URL = API_CONFIG.API_URL;

class CategoryService {

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = localStorage.getItem('token');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (options.headers) {
            const additionalHeaders = options.headers as Record<string, string>;
            Object.assign(headers, additionalHeaders);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }

        const result = await response.json();
        return result.data;
    }

    async getCategories(): Promise<any[]> {
        return this.request<any[]>('/categories');
    }

    // Admin Methods
    async createCategory(categoryData: { name: string; description?: string }): Promise<any> {
        return this.request<any>('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    }

    async updateCategory(categoryData: { id: number; name?: string; description?: string }): Promise<any> {
        return this.request<any>('/categories', {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    }

    async deleteCategory(categoryId: number): Promise<any> {
        return this.request<any>(`/categories/${categoryId}`, {
            method: 'DELETE',
        });
    }



}

export const categoryService = new CategoryService();