import React, { useState } from "react";
import image from "../images/back.jpeg";
import LogoImage from "../images/LoginLogo.jpg";
import "../css/login.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
    NotificationContainer,
    NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import {server} from './server'

const Login = (props) => {
    const imgStyle = {
        width: "400px",
        height: "450px",
        marginLeft: "10px",
    };

    const [login, setLogin] = useState({ username: "", password: "" });

    const handleChange = (e) => {
        setLogin({ ...login, [e.target.name]: e.target.value });
    };

    let history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(`${server}${props.loginRoute}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: login.username,
                password: login.password,
            }),
        });
        const json = await response.json();
        console.log("login json ", json);
        if (json.success && json.message) {
            // Save the auth token and redirect
            localStorage.setItem("token", json.token);
            setTimeout(() => history(props.path), 800);

            NotificationManager.success(json.message, "", 700);
        } else {
            NotificationManager.error(json.message, "", 700);
        }
    };

    return (
        <>
            {/* Student/Supervisor/Committee heading */}
            <div className="login-container">
                <div className="login-content">
                    <div className="left-panel">
                        <div className="image-container">
                            <img src={image} alt="Background" className="login-bg-image" />
                        </div>
                    </div>
                    <div className="right-panel">
                        <img src={LogoImage} alt="Logo" className="logo-image" />
                        <h2>{props.formHeading}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <div className="input-with-icon">
                                    <i className="fas fa-user"></i>
                                    <input
                                        type="username"
                                        placeholder="Username"
                                        className="form-control, C3"
                                        id="exampleInputusername1"
                                        aria-describedby="usernameHelp"
                                        name="username"
                                        value={login.username}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-with-icon">
                                    <i className="fas fa-lock"></i>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="form-control, C3"
                                        id="exampleInputPassword1"
                                        value={login.password}
                                        name="password"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <Link to={`/${props.user}/forgotpassword`}>
                                    Forgot Password?
                                </Link>
                            </div>
                            <button
                                type="submit"
                                className="login-button"
                                disabled={login.password.length < 4}
                            >
                                <i className="fas fa-sign-in-alt"></i> Login
                            </button>
                        </form>
                    </div>
                </div>
                <NotificationContainer />
            </div>
        </>
    );
};

export default Login;
