import React, { useEffect, useState } from 'react';
import Loading from './Loading';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { useNavigate } from 'react-router-dom';
import image from '../images/home.jpg'
import {server} from './server'

const Dashboard = (props) => {
  const history = useNavigate();

  const [rules, setRules] = useState({ roles: [] });
  const [loading, setLoading] = useState(false);
  const getRules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      setLoading(true);
      const response = await axios.get(`${server}/rules/get-all-roles`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });
      const json = await response.data;
      setRules(json);
      setLoading(false);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getRules();
    } else {
      history('/');
    }
  }, []);

  const capitalize = (word) => {
    return word[0].toUpperCase() + word.slice(1, word.length);
  };

  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(${image})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        minHeight: '87.4vh', // Ensure the background covers the entire viewport height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color:"white"
  }
  return (
    <div style={backgroundStyle}>
    {!loading? <div>
      <div className='d-flex justify-content-between mx-5' style={{position:"relative", marginTop :"-10px"}}>
        <div className='my-3' style={{ width: "45%" }}>
          <h1 className='text-center' style={{ fontFamily: "Georgia, serif", color:"white" }}>FYP PROCTORING</h1>
          <p style={{ padding: "20px", lineHeight: "2", color:"white" }} className='text-center'>FYP proctoring is a centralized platform that provides students with complete guideline regarding the FYP process, its rules and regulation. Students can communicate with their supervisor throughout the process and can request for meeting. Supervisors have authority to assign task, manage project progress, keep track of ongoing progress, provide feedback and can schedule meeting with their students. Additionally, the administration is responsible for student registration, verification and keep track of progress of all final year projects.</p>
        </div>
        <div className='my-2' style={{ border: "none", width: "37%", maxHeight: "60vh", overflowY: "auto" }}>
          {rules.roles.map((elm, index) => {
            return (
              <div className="rules" key={index}> 
                <h2 style={{ fontFamily: "Georgia, serif", color:"white" }}>{capitalize(elm.role)}</h2>
                <ul style={{ padding: "0px 20px", paddingRight: "150px" }}>
                  {elm.rules.map((rule, ruleIndex) => (
                    <li key={ruleIndex}>{rule}</li>
                  ))}
                </ul>
              </div>
            );
          })
          }
        </div>
        <NotificationContainer />
      </div>
      <footer className='text-center' style={{ background: "maroon", color: "white", padding: "2px 8px", lineHeight:"1", height: "130px", position:"relative", bottom:"-18px"}}>
        <p>Contact Information</p>
        <p>Computer Science Department</p>
        <p>Government College University, Main Campus</p>
        <p>CopyRights Reserved By @GCU Lahore</p>
      </footer>
    </div>: <Loading/>}
    </div>
  )
}

export default Dashboard;
