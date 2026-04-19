import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your local IP address for mobile devices, or 'http://localhost:5001/api' for iOS simulator
// and 'http://10.0.2.2:5001/api' for Android emulator.
const BASE_URL = 'https://freelance-connect.vercel.app/api';
// const BASE_URL = 'http://localhost:5001/api'; 

interface RequestOptions extends RequestInit {
    body?: any;
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
    const token = await AsyncStorage.getItem('skill_link_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    if (options.body && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body);
    }

    let response;
    try {
        response = await fetch(`${BASE_URL}${endpoint}`, config);

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error(`Non-JSON response from ${endpoint}:`, text.substring(0, 200));
            throw new Error(`Server returned non-JSON response (${response.status})`);
        }

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error: any) {
        console.error(`API Error (${endpoint}):`, error.message);
        throw error;
    }
};

export const uploadImage = async (imageUri: string) => {
    const token = await AsyncStorage.getItem('skill_link_token');

    const formData = new FormData();
    // In React Native, the file object in FormData needs special handling
    const filename = imageUri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type,
    } as any);

    try {
        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
                // Do NOT set Content-Type for FormData, the browser/fetch will set it with the boundary
            },
        });

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error('Non-JSON response from upload:', text.substring(0, 200));
            throw new Error(`Server returned non-JSON response (${response.status})`);
        }

        if (!response.ok) {
            throw new Error(data.message || 'Image upload failed');
        }
        return data;
    } catch (error: any) {
        console.error('Upload Error Details:', {
            message: error.message,
            stack: error.stack,
            url: `${BASE_URL}/upload`
        });
        if (error.message === 'Network request failed') {
            console.warn('Connectivity Check: Ensure your device has internet and the backend server at ' + BASE_URL + ' is reachable.');
        }
        throw error;
    }

};
