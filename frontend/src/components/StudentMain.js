import React from 'react'
import { Routes, Route, useLocation, Outlet } from 'react-router-dom'
import Login from './Login'
import ForgotPassword from './ForgotPassword'
import Progress from './Student/Progress'
import Tasks from './Student/Tasks'
import MyGroup from './Student/MyGroup'
import StuNav from './Student/StuNav'
import FypIdeas from './Student/FypIdeas'
import Notification from './Notification'
import Dashboard from './Dashboard'
import ProjectList from './Committee/ProjectList'
import StuRequest from './Student/StuRequest'
import Supervisors from './Student/Supervisors'
import ResetPassword from './ResetPassword'

const StudentMain = (props) => {
  const location = useLocation();

  // Define an array of paths where the sidebar should not be shown
  const pathsWithoutSidebar = ['/', '/forgotpassword', '/studentMain', '/studentMain/forgotpassword'];

  // Check if the current location is in the pathsWithoutSidebar array
  const showSidebar = pathsWithoutSidebar.includes(location.pathname);
  return (
    <div>
      <>
        <div>
          {!showSidebar && (
            <StuNav title1='Dashboard' link1='dashboard' title2='Project Progress' user='studentMain'
              link2='progress' title3='Tasks' link3='tasks' title4='My Group'
              link4='group' title5='Fyp Ideas' link5='ideas' detailLink='student' title7='Requests'
              link7='requests' link00='supervisors' title00='Supervisors' title6='Project List'
              link6='project'
              link01='notification' hide='d-none'
            />
          )}
        </div>
        <Routes>
          <Route path='/' exact element={<Login 
            formHeading='Student Login' mainHeading='FYP PROCTORING' user='studentMain'
            loginRoute='/student/login' path='/studentMain/dashboard' />} />
          <Route path='/forgotpassword' exact element={<ForgotPassword detailLink='student'  />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/progress' element={<Progress />} />
          <Route path='/tasks' element={<Tasks />} />
          <Route path='/group' element={<MyGroup />} />
          <Route path='/ideas' element={<FypIdeas />} />
          <Route path='/notification' element={<Notification user='student' />} />
          <Route path='/requests' element={<StuRequest />} />
          <Route path='/supervisors' element={<Supervisors />} />
          <Route path='/project' element={<ProjectList user='student'/>} />
          <Route path='/reset_password/:id/:token' element={<ResetPassword user='student'/>} />
        </Routes>
      </>
    </div>
  )
}

export default StudentMain
