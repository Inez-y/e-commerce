// Small helper for admin token access
export function getAccessToken() {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getitem('accessToken');
}

export function getStoredUser() {
    if (typeof window === 'undefined') {
        return null
    }

    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
        return null;
    }

    try { 
        return JSON.parse(rawUser) as {
            id: string;
            email: string;
            role: 'ADMIN' | 'CUSTOMER';
        };
    }
    catch {
        return null;
    }
}

export function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
}
