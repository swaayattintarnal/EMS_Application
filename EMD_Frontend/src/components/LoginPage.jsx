import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [level, setLevel] = useState('');

    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();


    const API_BASE_URL = 'http://localhost:3000';

    const handleLogIn = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/admin-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Something went wrong on the server.' }));
                alert(errorData.message || 'Login failed!');
                return;
            }

            const data = await response.json();

            console.log('Login successful:', data);
            localStorage.setItem('token', data.token);
            localStorage.setItem('adminName', data.admin.name);
            localStorage.setItem('adminEmail', data.admin.email);
            localStorage.setItem('adminLevel', data.admin.level);
            localStorage.setItem('adminId', data.admin.id);

 console.log('Admin ID saved to localStorage:', data.admin.id);
            navigate('/homepage');

        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof SyntaxError && error.message.includes('JSON')) {
                alert('An unexpected response format was received from the server during login. Please try again.');
                console.error('Server response might not be JSON. Check network tab for details.');
            } else {
                alert('Server error during login.');
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/admin-registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, level }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Something went wrong on the server.' }));
                alert(errorData.message || 'Registration failed!');
                return;
            }

            const data = await response.json();

            alert(data.message);
            setIsRegistering(false);
            setEmail('');
            setPassword('');
            setName('');
            setLevel('');

        } catch (error) {
            console.error('Registration error:', error);
            if (error instanceof SyntaxError && error.message.includes('JSON')) {
                alert('An unexpected response format was received from the server during registration. Please try again.');
                console.error('Server response might not be JSON for registration. Check network tab for details.');
            } else {
                alert('Server error during registration.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4 sm:p-6 md:p-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row w-full max-w-4xl min-h-[500px] md:h-[600px]">
                {/* Left Section: Log In / Register */}
                <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center items-center order-2 md:order-1">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6 md:mb-8 text-center">
                        {isRegistering ? 'Register' : 'Log In'}
                    </h2>

                    <p className="text-gray-500 text-sm mb-4 md:mb-6 text-center">
                        {isRegistering ? 'Create your account' : 'Use your email & password'}
                    </p>

                    <form onSubmit={isRegistering ? handleRegister : handleLogIn} className="w-full space-y-4 md:space-y-6 max-w-sm">
                        {isRegistering && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="w-full p-2.5 sm:p-3 border border-light-purple-bg rounded-lg bg-light-purple-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent transition text-sm sm:text-base"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full p-2.5 sm:p-3 border border-light-purple-bg rounded-lg bg-light-purple-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent transition text-sm sm:text-base"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full p-2.5 sm:p-3 border border-light-purple-bg rounded-lg bg-light-purple-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent transition text-sm sm:text-base"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {isRegistering && (
                            <div>
                                <select
                                    className="w-full p-2.5 sm:p-3 border border-light-purple-bg rounded-lg bg-light-purple-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent transition text-sm sm:text-base"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Level</option>
                                    <option value="1">Level 1</option>
                                    <option value="2">Level 2</option>
                                    <option value="3">Level 3</option>
                                    <option value="4">Level 4</option>
                                </select>
                            </div>
                        )}



                        <button
                            type="submit"
                            className="w-full bg-primary-purple text-white py-2.5 sm:py-3 rounded-full font-semibold hover:bg-secondary-purple transition duration-300 transform hover:scale-105 shadow-md text-sm sm:text-base"
                        >
                            {isRegistering ? 'REGISTER' : 'LOG IN'}
                        </button>
                    </form>

                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="mt-4 text-primary-purple hover:underline"
                    >
                        {isRegistering ? 'Already have an account? Log In' : 'Don\'t have an account? Register'}
                    </button>
                </div>

                {/* Right Section */}
                <div className="w-full md:w-1/2 bg-primary-purple p-6 sm:p-8 md:p-12 flex flex-col justify-center items-center text-center relative order-1 md:order-2 rounded-t-2xl md:rounded-l-none md:rounded-r-2xl">
                    <div className="absolute inset-y-0 left-0 bg-white hidden md:block" style={{
                        width: '100px',
                        clipPath: 'ellipse(100% 50% at 0% 50%)',
                        borderRadius: '0 50% 50% 0'
                    }}></div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 z-10 ml-[5rem]">Employee Data Management </h2>
                    <p className="text-text-light text-sm md:text-md mb-6 md:mb-8 px-2 sm:px-4 z-10 ml-[5rem]">
                        Seamlessly manage all your employee data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;