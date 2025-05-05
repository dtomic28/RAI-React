import { useEffect, useContext } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

const apiUrl = import.meta.env.BACKEND_URL;

function Logout(){
    const userContext = useContext(UserContext); 
    useEffect(function(){
        const logout = async function(){
            userContext.setUserContext(null);
            const res = await fetch(`${apiUrl}/users/logout`);
        }
        logout();
    }, []);

    return (
        <Navigate replace to="/" />
    );
}

export default Logout;