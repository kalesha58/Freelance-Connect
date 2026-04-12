import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your local IP address for mobile devices, or 'http://localhost:5001/api' for iOS simulator
// and 'http://10.0.2.2:5001/api' for Android emulator.
const BASE_URL = 'https://freelance-connect.vercel.app/api'; 
// const BASE_URL = 'http://localhost:5001/api'; 

interface RequestOptions extends RequestInit {
    body?: any;
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
    const token = await AsyncStorage.getItem('tasker_token');

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
        cache: 'no-store',
    };

    if (options.body && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json();

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
    const token = await AsyncStorage.getItem('tasker_token');
    
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

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Image upload failed');
        }
        return data;
    } catch (error: any) {
        console.error('Upload Error:', error.message);
        throw error;
    }
};
