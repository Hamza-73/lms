import './App.css';
import React, { useState } from 'react';
import StudentMain from './components/StudentMain';
import CommitteeMain from './components/CommitteeMain';
import SupervisorMain from './components/SupervisorMain';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import logo from './images/logo.png'
import landingLogo from './images/LoginLogo.jpg'
import AdminMain from './components/AdminMain';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation()

  const path = useNavigate();

  const handleStudent = () => {
    path('/studentMain');
  }

  const handleSupervisor = () => {
    path('/supervisorMain');
  }

  const handleCommittee = () => {
    path('/committeeMain');
  }
  const handleAdmin = () => {
    path('/adminMain')
  }

  const pathsWithoutSidebar = ['/'];

  // Check if the current location is in the pathsWithoutSidebar array
  const showSidebar = pathsWithoutSidebar.includes(location.pathname);

  const style = `
  body{   
    background-color: White;
  }
  
  .cards{
    border:none;
  }
  .m-box{
    display : flex;
    margin-top:6%;
  }
  .boxs{
    border: 1px solid black;
    border-radius : 5px;
    margin: 8px;
    border-radius : 10px;
    height: 340px;
    width : 500px !important;
    display: flex;
    flex-direction : column;
    justify-content: center;
    align-items:center;
    transition : 1s ;
    padding: 20px;
    cursor:pointer;
    background : rgba(90,0,6,.7);
    background-image: linear-gradient(#00005b,#5a0006);
    color : white;box-shadow: 0 18px 28px rgba(0, 0, 0, 1);
  }
  .boxs img{
    width: 60%;
    margin : 0 auto;
    margin-bottom : 10px;
  }
  .boxs:hover{
    z-index: 3;
    transform : scale(1.2);
  }
  @media (max-width : 480px) {
    .m-box{
      flex-direction: column;
      position : relative ;
      left : -15px;
    }
    .boxs{
      width: 300px;
      height:300px;
    }
  }
  `
  return (
    <div>
      <Routes>
      <Route path='/studentMain/*' element={<StudentMain />} />
        <Route path='/supervisorMain/*' element={<SupervisorMain />} />
        <Route path='/committeeMain/*' element={<CommitteeMain />} />
        <Route path='/adminMain/*' element={<AdminMain />} />
      </Routes>
      {showSidebar && (
        <div>
          <style>{style}</style>
          <div className="cards text-center container">
          <div>
          <img src={landingLogo} alt="GCU Logo" />
            <p>"Welcome to our FYP Proctoring System - Where your final year project journey begins!</p>
          </div>
            <div className='m-box'>
              <div className="boxs" onClick={handleAdmin}>
                <img src={logo} alt="" />
                <h5>Admin</h5>
              </div>
              <div className="boxs" onClick={handleCommittee}>
                <img src={logo} alt="" />
                <h5>Committee</h5>
              </div>
              <div className="boxs" onClick={handleSupervisor}>
                <img src={logo} alt="" />
                <h5>Supervisor</h5>
              </div>
              <div className="boxs" onClick={handleStudent}>
                <img src={logo} alt="" />
                <h5>Student</h5>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;