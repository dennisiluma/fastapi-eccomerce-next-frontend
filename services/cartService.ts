import { API_CONFIG } from './apiUrl';

const API_BASE_URL = API_CONFIG.API_URL;


class CartService {

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


    async getCart(): Promise<any> {
        return this.request<any>('/cart', {
            method: 'GET',
        });
    }


    async addToCart(productId: number, quantity: number = 1): Promise<any> {
        return this.request<any>('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
    }

    async decrementItem(productId: number): Promise<any> {
        return this.request<any>(`/cart/decrement/${productId}`, {
            method: 'POST',
        });
    }

    async removeItem(productId: number): Promise<any> {
        return this.request<any>(`/cart/remove/${productId}`, {
            method: 'DELETE',
        });
    }

    async clearCart(): Promise<any> {
        return this.request<any>('/cart/clear', {
            method: 'DELETE',
        });
    }

    async checkout(): Promise<any> {
        return this.request<any>('/orders/checkout', {
            method: 'POST',
        });
    }


}


export const cartService = new CartService();