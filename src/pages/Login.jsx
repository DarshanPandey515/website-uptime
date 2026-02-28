import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/authStore';

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState("")
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard')
        }
    }, [isAuthenticated])



    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);

        if (success) {
            navigate('/dashboard');
        } else {
            setUsername("")
            setPassword("")
            setFormError("Invalid Credentials, Please try again.")
        }
    }


    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-sm p-6 rounded-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Login to continue</h1>
                <div className="mb-4">

                    <p>
                        {formError}
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            id="username"
                            placeholder='username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-700 rounded-3xl focus:outline-none focus:border-zinc-500"
                        />
                    </div>

                    <div className="mb-6">
                        <input
                            type="password"
                            id="password"
                            placeholder='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-700 rounded-3xl focus:outline-none focus:border-zinc-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-zinc-800 text-white py-2 px-4 rounded-xl hover:bg-zinc-800/90 cursor-pointer transition-colors"
                    >
                        Log in
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login