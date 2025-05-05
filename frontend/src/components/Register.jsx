import { useState } from 'react';

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const apiUrl = import.meta.env.VITE_BACKEND_URL;

    async function handleRegister(e){
        e.preventDefault();
        try {
            const res = await fetch(`${apiUrl}/users`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    username: username,
                    password: password
                })
            });
            const data = await res.json();
            if(data._id !== undefined){
                window.location.href="/";
            }
            else{
                setUsername("");
                setPassword("");
                setEmail("");
                setError("Registration failed. Please try again.");
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        }
    }

    return(
        <form onSubmit={handleRegister} className="flex flex-col gap-4 max-w-md mx-auto p-4">
            <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e)=>(setEmail(e.target.value))}
                className="p-2 border rounded"
            />
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
                Register
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
}

export default Register;