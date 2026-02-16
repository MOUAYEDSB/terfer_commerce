
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
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
            const { data } = await axios.post('http://localhost:5000/api/users/register', userData);
            // Don't auto-login, just return success
            return { success: true, message: 'Inscription réussie ! Veuillez vous connecter.' };
        } catch (error) {
            console.error('Register error:', error.response?.data?.message || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
