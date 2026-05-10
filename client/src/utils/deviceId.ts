import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'skill_link_device_id';

let cachedDeviceId: string | null = null;

/**
 * Generate a UUIDv4-style string without external deps.
 */
const uuidv4 = (): string => {
    // RFC4122 v4 — Math.random based; sufficient for installation-level tracking
    const hex = '0123456789abcdef';
    let out = '';
    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            out += '-';
        } else if (i === 14) {
            out += '4';
        } else if (i === 19) {
            out += hex[(Math.floor(Math.random() * 4)) | 8];
        } else {
            out += hex[Math.floor(Math.random() * 16)];
        }
    }
    return out;
};

/**
 * Returns a stable per-installation device id, persisted in AsyncStorage.
 * Generated lazily on first call. Reinstalling the app produces a new id.
 */
export const getDeviceId = async (): Promise<string> => {
    if (cachedDeviceId) return cachedDeviceId;
    try {
        const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (stored) {
            cachedDeviceId = stored;
            return stored;
        }
        const fresh = uuidv4();
        await AsyncStorage.setItem(DEVICE_ID_KEY, fresh);
        cachedDeviceId = fresh;
        return fresh;
    } catch {
        const fallback = uuidv4();
        cachedDeviceId = fallback;
        return fallback;
    }
};
