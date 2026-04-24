import axios from 'axios';

/**
 * Base API Client using axios
 * Handles base URL, default headers, and common error handling
 */

const BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const apiClient = {
    async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        try {
            const response = await axiosInstance.get<T>(endpoint, {
                headers: options.headers as any,
                signal: options.signal as any,
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(`API Error: ${error.response.status} ${error.response.statusText || ''}`.trim());
            }
            throw error;
        }
    },

    async post<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
        try {
            const response = await axiosInstance.post<T>(endpoint, body, {
                headers: options.headers as any,
                signal: options.signal as any,
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(`API Error: ${error.response.status} ${error.response.statusText || ''}`.trim());
            }
            throw error;
        }
    },
};

// Sample usage for the requested endpoint
export const fetchAlice = () => apiClient.get('/users/alice');
