import React from 'react'
import { Route, Router, Routes, useLocation } from 'react-router-dom'
import Login from './Login'
import Dashboard from './Dashboard'
import SideBar from './SideBar'
import Group from '../components/Supervisor/Groups'
import GroupDetail from './Supervisor/GroupDetail'
import Meeting from './Meeting'
import ProjectIdeas from './Supervisor/ProjectIdeas'
import ProjectRequest from './Supervisor/ProjectRequests'
import Notification from './Notification'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'
import ExtensionRequests from './Supervisor/ExtensionRequests'

const SupervisorMain = (props) => {

  const location = useLocation();

  // Define an array of paths where the sidebar should not be shown
  const pathsWithoutSidebar = ['/', '/forgotpassword', '/supervisorMain', '/supervisorMain/forgotpassword'];

  // Check if the current location is in the pathsWithoutSidebar array
  const showSidebar = pathsWithoutSidebar.includes(location.pathname);
  return (
    <div>
      <div>
        {!showSidebar && (
          <SideBar detailLink='supervisor' title1='Dashboard' link1='dashboard'
            title2='Groups Under Me' user='supervisorMain'
            link2='group' title3='Groups' link3='groupDetail' title4='Meeting' link4='meeting'
            title5='FYP Ideas' link5='ideas' title6='FYP Requests' link6='requests' hide='d-none'
            title7='Notifications' link7='notification' link00='extension' title00='Extension Requests' />
        )}
      </div>
      <Routes>
        <Route path='/' exact element={<Login user='supervisorMain'
          formHeading='Supervisor Login' mainHeading='FYP PROCTORING'
          loginRoute='/supervisor/login' path='/supervisorMain/dashboard' />} />
        <Route path='/forgotpassword' element={<ForgotPassword detailLink='supervisor' />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/group' element={<Group />} />
        <Route path='/groupDetail' element={<GroupDetail />} />
        <Route path='/meeting' element={<Meeting />} />
        <Route path='/ideas' element={<ProjectIdeas />} />
        <Route path='/requests' element={<ProjectRequest />} />
        <Route path='/notification' element={<Notification user='supervisor' />} />
        <Route path='/extension' element={<ExtensionRequests />} />
        <Route path='/reset_password/:id/:token' element={<ResetPassword user='supervisor' />} />
      </Routes>
    </div>
  )
}

export default SupervisorMain