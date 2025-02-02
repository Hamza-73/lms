import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import image from '../images/home.jpg';
import {server} from './server'

const ResetPassword = (props) => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { id, token } = useParams();

    const containerStyle = {
        background: `url(${image}) center/cover no-repeat`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '87.28vh',
    };

    const contentStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: "500px"
    };

    const formGroupStyle = {
        marginBottom: '15px',
        textAlign: 'left',
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .post(`${server}/${props.user}/reset-password/${id}/${token}`, { password })
            .then((res) => {
                if (res.data.success) {
                    alert(res.data.message);
                    navigate(`/`)
                }
            })
            .catch((err) => console.log(err));
    };

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                <h2>Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    <div style={formGroupStyle}>
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            autoComplete="off"
                            name="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required = {true} minLength={6}
                        />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '20px', background: "maroon", color: "white" }}>
                        Update
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
