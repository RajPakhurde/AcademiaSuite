import React, { useState } from "react";
import '../../assets/styles/login.css';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SchoolIcon from '@mui/icons-material/School';

const Login = (props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isblur, setIsblur] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();   
        loginUser();
    }
    
    const loginUser = async () => {
        const user = await window.api.invoke('login-user', {username, password});
        
        switch (user) {
            case 'IP':
                setMessage("Invalid password")
                break;
            case 'UNF':
                setMessage("User not found")
                break;
            case 'DE':
                setMessage("Database error")
                break;
            default:
                props.setUser(user.username);
                loading()
                break;
        }
    };

    const loading = () => {
        setIsblur(true);
        setTimeout(() => {
            props.setActiveComponent('dashboard')
        }, 2000);
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <div className={`w-full max-w-md ${isblur ? 'blur' : ''}`}>
                <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300">
                    <div className="text-center mb-8">
                        <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SchoolIcon style={{ fontSize: '2rem', color: 'white' }} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                        <p className="text-gray-500 mt-2">Please sign in to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <PersonOutlineOutlinedIcon className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockOutlinedIcon className="text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                required
                            />
                            <div 
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                            </div>
                        </div>

                        {message && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </div>

            {isblur && (
                <Box sx={{ 
                    width: '50%',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 50
                }}>
                    <LinearProgress />
                </Box>
            )}
        </div>
    );
}

export default Login;