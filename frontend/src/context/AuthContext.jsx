
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateUser = (nextUser) => {
        if (nextUser) {
            const existingToken = localStorage.getItem('token');
            const mergedUser = {
                ...nextUser,
                token: nextUser.token || existingToken
            };
            setUser(mergedUser);
            localStorage.setItem('user', JSON.stringify(mergedUser));
            if (mergedUser.token) {
                localStorage.setItem('token', mergedUser.token);
            } else {
                localStorage.removeItem('token');
            }
            return;
        }

        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            const existingToken = localStorage.getItem('token');
            setUser({ ...parsed, token: parsed.token || existingToken });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
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
            const { data } = await axios.post('http://localhost:5000/api/users/register', userData);
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

    const logout = () => {
        updateUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
