import { API_CONFIG } from "./apiUrl";

const API_BASE_URL = API_CONFIG.API_URL

class AuthService {




    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add token to request if it exists
        const token = this.getToken();
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




    private async requestFormData<T>(
        endpoint: string,
        formData: FormData,
        options: RequestInit = {}
    ): Promise<T> {
        const token = this.getToken();

        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }

        const result = await response.json();
        return result.data;
    }




    async register(userData: any): Promise<any> {
        return this.request<any>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials: any): Promise<any> {
        return this.request<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async getCurrentUser(): Promise<any> {
        return this.request<any>('/users/me', {
            method: 'GET',
        });
    }

    async updateProfile(updateData: any): Promise<any> {
        return this.request<any>('/users/update-profile', {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }


    async uploadAvatar(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.requestFormData<any>('/users/upload-avatar', formData);
    }

    async changePassword(passwordData: any): Promise<any> {
        return this.request<any>('/users/change-password', {
            method: 'PUT',
            body: JSON.stringify(passwordData),
        });
    }


    async forgotPassword(email: string): Promise<any> {
        return this.request<any>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async resetPassword(code: string, password: string): Promise<any> {
        return this.request<any>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ code, password }),
        });
    }



    saveAuthData(token: string, role: string): void {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUserRole(): string | null {
        return localStorage.getItem('userRole');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    isAdmin(): boolean {
        return this.getUserRole() === 'ADMIN';
    }

    isDelivery(): boolean {
        return this.getUserRole() === 'DELIVERY';
    }


}

export const authService = new AuthService();




