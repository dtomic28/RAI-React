// src/components/Logout.js
import { useEffect, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { Navigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_BACKEND_URL;  // Ensure the backend URL is correctly set in the environment variables

function Logout() {
    const userContext = useContext(UserContext);

    useEffect(() => {
        const logout = async () => {
            try {
                // Clear user context (this will reset the user state in the context)
                userContext.setUserContext(null);

                // Make the logout request to the server
                const res = await fetch(`${apiUrl}/users/logout`, {
                    method: 'POST',  // Assuming POST method for logout (if it's different, change it)
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // You can also include the JWT in the headers for the server to validate
                    // headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
                });

                if (!res.ok) {
                    console.error('Failed to log out');
                }
            } catch (error) {
                console.error('Error logging out:', error);
            }
        };

        logout();
    }, [userContext]);

    return (
        <Navigate replace to="/" />
    );
}

export default Logout;
