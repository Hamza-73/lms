import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import image1 from '../../images/logo.png'
import axios from 'axios'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import {server} from '../server'


const ComNav = (props) => {
    let history = useNavigate()
    const handleLogout = () => {
        localStorage.removeItem('token')
        console.log('Logout successfully localStorage is :', localStorage.getItem('token'))
        setTimeout(() => {
            history('/');
        }, 1200)

        NotificationManager.success('Logout Successfully', '', 1000);
    }

    const [userData, setUserData] = useState({ member: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getDetail = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('token not found');
                    return;
                }

                const response = await fetch(`${server}/${props.detailLink}/detail`, {
                    method: 'GET',
                    headers: {
                        'Authorization': token
                    },
                });

                if (!response.ok) {
                    console.log('error fetching detail', response);
                    return; // Exit early on error
                }

                const json = await response.json();
                console.log('json is in sidebar: ', json);
                if (json) {
                    //   console.log('User data is: ', json);
                    setUserData(json);
                    setLoading(false)
                }
            } catch (err) {
                console.log('error is in sidebar: ', err);
            }
        };

        if (localStorage.getItem('token')) {
            setTimeout(() => {
                getDetail();
            }, 700)
        }
    }, []); // Empty dependency array to run the effect only once    

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-body-tertiary text-dark" style={{ "backgroundColor": "rgba(0, 0, 0, 0.5)", color: "black", height: "80px" }}>
                <div className="container-fluid">
                    <p className="navbar-brand" to='/dashboard' ><img src={image1} alt="" style={{ "width": "60px", "cursor": "pointer" }} /></p>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to={`/${props.user}/${props.link1}`} >{props.title1}</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.user}/${props.link2}`}>{props.title2}</Link>
                            </li>
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    data-bs-target="#yourDropdownMenuId"
                                    role="button"
                                    aria-expanded="false"
                                >
                                    {props.title001}
                                </a>
                                <ul className="dropdown-menu">
                                    <li><Link className="dropdown-item" to={`/${props.user}/${props.link3}`}>{props.title3}</Link> </li>
                                    <li><Link className="dropdown-item" to={`/${props.user}/${props.link4}`}>{props.title4}</Link></li>
                                    <li><Link className="dropdown-item" to={`/${props.user}/${props.link5}`}>{props.title5}</Link></li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.user}/${props.link00}`}>{props.title00}</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.user}/${props.link01}`}>{props.title01}</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.user}/${props.link02}`}>{props.title02}</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.user}/${props.link03}`}>{props.title03}<i style={{fontSize:"20px"}} className="fa-solid fa-bell"></i></Link>
                            </li>
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    data-bs-target="#yourDropdownMenuId"
                                    role="button"
                                    aria-expanded="false"
                                >
                                    {props.title0}
                                </a>
                                <ul className="dropdown-menu">
                                    <li><Link className="dropdown-item" to={`/${props.user}/${props.link6}`}>{props.title6}</Link> </li>
                                    <li><Link className="dropdown-item" to={`/${props.user}/${props.link8}`}>{props.title8}</Link></li>
                                    <li><Link className="dropdown-item" to={`/${props.user}/${props.link9}`}>{props.title9}</Link></li>
                                    <li><Link className="dropdown-item" to={`/${props.user}/${props.link10}`}>{props.title10}</Link></li>
                                </ul>
                            </li>
                        </ul>
                        <form className={`d-flex ${!localStorage.getItem('token') ? 'd-none' : ''} `} role="search">
                            <h6 className={`text-center`}>{
                                !loading
                                    ? (
                                        userData
                                            ? (
                                                props.user === 'studentMain'
                                                    ? userData.member.rollNo
                                                    : userData.member.username
                                            )
                                            : "username"
                                    )
                                    : 'loading...'
                            }
                                <br /> BS Computer Science</h6>
                            <button style={{ background: "maroon", color: "white" }} className="btn mx-3" type="button" onClick={handleLogout}>Logout</button>
                        </form>
                    </div>
                </div>
            </nav>
            <NotificationContainer />
        </>
    )
}
ComNav.defaultProps = {
    title5: "", title6: "", title7: "", title8: "",
    title00: "", title01: "", title02: "", link5: "/",
    link6: "/", link7: "/", link8: "/", link00: "/", link01: "/",
    link01: "/",
}
export default ComNav