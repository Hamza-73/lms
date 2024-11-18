import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
// import styles from '../css/forgotPassword.module.css';

import image from '../images/home.jpg'
import Loading from './Loading';

const ForgotPassword = (props) => {


    const [text, setText] = useState({
        username: '',
    })
    const [ loading , setLoading ] = useState(false);
    const handleChange = (e) => {
        setText({ ...text, [e.target.name]: e.target.value });
    }

    let history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const response = await fetch(`http://localhost:5000/${props.detailLink}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: text.username })
        });
        const json = await response.json()
        console.log('jso i s', json)
        console.log(json);
        if (json.success) {
            setLoading(false);
            setTimeout(()=>{
                NotificationManager.success(json.message,'',1000);
            }, 1000)
            setTimeout(() => {
                history("/");
            }, 2200)
        }
        else {
            NotificationManager.error(json.message,'',800);
        }
        setLoading(false);
    }

    const backgroundStyle = {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(${image})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh', // Ensure the background covers the entire viewport height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color:"white",
    };
    
    

    return (
        <>
        {!loading ?<div style={backgroundStyle}>
            <div className={`container  my-5`} style={{border:"none"}}>
                <h1 className='my-3 text-center' style={{fontWeight:"600"}}>Update Password</h1>
                <form className='my-5 mx-3' onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="exampleInputusername1" className="form-label"> <h3 style={{fontWeight:"500"}}>Email</h3></label>
                        <input type="email" required className="form-control" id="exampleInputusername1" aria-describedby="usernameHelp" value={text.username} name='username' onChange={handleChange} />
                    </div>
                    <button type="submit" disabled={!text.username} className="btn btn-danger" style={{background:"maroon", color:"white", cursor:"pointer", width:"100%"}}>Recover Password</button>
                </form>
                <NotificationContainer />
            </div>
        </div> : <Loading/> }
        </>
    )
}

export default ForgotPassword
