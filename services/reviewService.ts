
import { API_CONFIG } from './apiUrl';

const API_BASE_URL = API_CONFIG.API_URL;

class ReviewService {


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


    async getProductRating(productId: number): Promise<any> {
        return this.request<any>(`/reviews/product/rating/${productId}`, {
            method: 'GET',
        });
    }


    async createReview(reviewData: any): Promise<any> {
        return this.request<any>('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    }
}

export const reviewService = new ReviewService();