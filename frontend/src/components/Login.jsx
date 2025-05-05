import { useContext, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_BACKEND_URL;

function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const userContext = useContext(UserContext); 

    async function handleLogin(e){
        e.preventDefault();
        try {
            const res = await fetch(`${apiUrl}/users/login`, {
                method: "POST",
                credentials: "include",
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            const data = await res.json();
            if(data._id !== undefined){
                userContext.setUserContext(data);
            } else {
                setUsername("");
                setPassword("");
                setError("Invalid username or password");
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        }
    }

    return (
        <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-md mx-auto p-4">
            {userContext.user ? <Navigate replace to="/" /> : ""}
            <input 
                type="text" 
                name="username" 
                placeholder="Username"
                value={username} 
                onChange={(e)=>(setUsername(e.target.value))}
                className="p-2 border rounded"
            />
            <input 
                type="password" 
                name="password" 
                placeholder="Password"
                value={password} 
                onChange={(e)=>(setPassword(e.target.value))}
                className="p-2 border rounded"
            />
            <button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
            >
                Log in
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
}

export default Login;