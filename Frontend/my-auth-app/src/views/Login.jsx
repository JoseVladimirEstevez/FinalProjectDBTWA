import React, { useState } from 'react'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';
import 'react-toastify/dist/ReactToastify.css';
import greenLogo from '../assets/greenLab.jpg';
import './Login.css';
import { serverUrl } from '../constansts';

function Login() {

    const [isLogin, setIsLogin] = useState(true);

    const [form, setForm] = useState({});

    const navigate = useNavigate();

    const handleFormToggle = () => {
        navigate('/register');
    };

    useEffect(() => {
        // Verify auth
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwt_decode(token);
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp >= currentTime) {
                    navigate('/');
                    return
                }
            } catch(err) {
                console.error(err);
                return
            }
        }
    }, [])

    function handleInputChange(key, newValue) {
        form[key] = newValue;   // ex: form["username"] = "toto";
        setForm(form);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginURL = serverUrl + '/auth/login';
        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'authorization': localStorage.getItem('token') // to authenticate a protected rule
            },
            body: JSON.stringify(form)
        }
        const response = await fetch(loginURL, options);
        console.log('response.status: ', response.status);

        if(response.status == 200) {
            const data= await response.json()
            console.log('data: ', data);

            const token = data.token;
            localStorage.setItem('token', token);

            const toastOptions = {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            }
            toast("Login successful!", toastOptions);
            setTimeout(() => {
                navigate('/') //navigate to home after after 2 seconds
            }, 2000)
        } else {
            const toastOptions = {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            }
            toast.error("Login failed!", toastOptions);
        }
    };

    return (
        <div>
            <div className='container'>
                <span className='align-self-center' >
                    <img src={greenLogo} alt="Green Lab" className='' />
                </span>
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className='row g-3 justify-content-center'>
                        <div className='col-auto'>
                            <label className='form-label' htmlFor="username">Username:</label>
                            <input className='form-control' type="username" id="username" required onChange={(event) => handleInputChange('username', event.target.value)}/>
                        </div>
                    </div>
                    <br />
                    <div className='row g-3 justify-content-center'>
                        <div className='col-auto'>
                            <label className='form-label' htmlFor="password">Password:</label>
                            <input className='form-control' type="password" id="password" required onChange={(event) => handleInputChange('password', event.target.value)}/>
                        </div>
                    </div>
                    <br />
                    <button type="submit">Submit</button>
                </form>
                <br />
                <button onClick={handleFormToggle}>
                    New User? Register Here
                </button>
            </div>
            <ToastContainer />
        </div>
    )
}

export default Login