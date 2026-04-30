import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const AuthContext = createContext(null);
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
    || process.env.REACT_APP_API_URL
    || 'http://localhost:8080';

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check for existing token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadCurrentUser();
        } else {
            // Check for OAuth2 callback token in URL
            const params = new URLSearchParams(window.location.search);
            const callbackToken = params.get('token');
            if (callbackToken) {
                localStorage.setItem('token', callbackToken);
                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);
                loadCurrentUser().then(() => {
                    navigate('/', { replace: true });
                }).catch(() => {
                    navigate('/login', { replace: true });
                });
            } else {
                setLoading(false);
            }
        }
    }, [navigate]);

    const loadCurrentUser = async () => {
        setLoading(true);
        try {
            const userData = await authApi.getMe();
            setUser(userData);
        } catch (err) {
            console.error('Failed to load user:', err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = useCallback(async (email, password) => {
        const result = await authApi.login(email, password);
        if (result?.token) {
            localStorage.setItem('token', result.token);
            setUser({
                id: result.id,
                email: result.email,
                name: result.name,
                role: result.role,
                profilePictureUrl: result.profilePictureUrl,
            });
        }
        return result;
    }, []);

    const register = useCallback(async (email, name, password) => {
        const result = await authApi.register(email, name, password);
        if (result?.token) {
            localStorage.setItem('token', result.token);
            setUser({
                id: result.id,
                email: result.email,
                name: result.name,
                role: result.role,
                profilePictureUrl: result.profilePictureUrl,
            });
        }
        return result;
    }, []);

    const loginWithGoogle = useCallback(() => {
        window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    }, []);

    const value = {
        user,
        role: user?.role || 'USER',
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isTechnician: user?.role === 'TECHNICIAN',
        isUser: user?.role === 'USER',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

