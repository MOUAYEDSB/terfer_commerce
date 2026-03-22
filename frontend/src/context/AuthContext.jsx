
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateUser = (nextUser) => {
        if (nextUser) {
            setUser(nextUser);
            return;
        }

        setUser(null);
    };

    useEffect(() => {
        const bootstrapSession = async () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            try {
                const { data } = await axios.get('http://localhost:5000/api/users/profile', { withCredentials: true });
                setUser(data);
            } catch (_) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        bootstrapSession();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(
                'http://localhost:5000/api/users/login',
                { email, password },
                { withCredentials: true }
            );
            updateUser(data);
            return { success: true, user: data };
        } catch (error) {
            console.error('Login error:', error.response?.data?.message || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Une erreur est survenue lors de la connexion'
            };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/users/register', userData, { withCredentials: true });
            // Don't auto-login, just return success
            return { success: true, message: data?.message || 'Inscription réussie ! Veuillez vous connecter.' };
        } catch (error) {
            console.error('Register error:', error.response?.data?.message || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:5000/api/users/logout', {}, { withCredentials: true });
        } catch (_) {
            // Ignore logout API errors and clear local auth state anyway.
        }
        updateUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
