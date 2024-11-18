import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './Login'
import CumDashboard from './Committee/CumDashboard'
import ProjectList from './Committee/ProjectList'
import StudentList from './Committee/StudentList'
import Event from './Committee/Event'
import SupervisorList from './Committee/SupervisorList'
import CommitteeMember from './Committee/CommitteeMember'
import ProjectProgress from './Committee/ProjectProgress'
import ForgotPassword from './ForgotPassword'
import Dashboard from './Dashboard'
import EligibleGroup from './Committee/EligibleGroup'
import Allocate from './Committee/Allocate'
import ComNav from './Committee/ComNav'
import ResetPassword from './ResetPassword'
import External from './Committee/External'
import ExtensionRequest from './Committee/ExtensionRequest'
import Notification from './Notification'

const CommitteeMain = (props) => {

    const location = useLocation();

    // Define an array of paths where the sidebar should not be shown
    const pathsWithoutSidebar = ['/', '/forgotpassword', '/committeeMain', '/committeeMain/forgotpassword'];

    // Check if the current location is in the pathsWithoutSidebar array
    const showSidebar = pathsWithoutSidebar.includes(location.pathname);
    return (
        <div>
            <div>
                {!showSidebar && (
                    <ComNav
                        title1='Home' link1='home'
                        title2='FYP Guidelines' link2='commdashboard' user='committeeMain'
                        title3='Committee Members' link3='members'
                        title4='Supervisor List' link4='supervisor'
                        title5='Student List' link5='student'
                        title6='Project List' link6='project' title01='External' link01='external'
                        title10='Scheduled Vivas' link10='event' title00='Allocate Group' link00='allocate'
                        detailLink='committee' title8='Pending Progress' link8='progress'
                        title9='Eligible Groups' link9='eligible' title0='Vivas'
                        title02='Extension Request' link02='extension' title001='Users' link03='notification'
                    />
                )}
            </div>
            <Routes>
                <Route path='/' element={<Login
                    formHeading='Committee Login' mainHeading='FYP PROCTORING'
                    loginRoute='/committee/login' path='/committeeMain/home' user='committeeMain'
                />} />
                <Route path='/forgotpassword' exact element={<ForgotPassword detailLink='committee' />} />
                <Route path='/commdashboard' element={<CumDashboard />} />
                <Route path='/home' element={<Dashboard />} />
                <Route path='/project' element={<ProjectList />} />
                <Route path='/student' element={<StudentList detailLink='committee' />} />
                <Route path='/event' element={<Event />} />
                <Route path='/supervisor' element={<SupervisorList detailLink='committee' />} />
                <Route path='/members' element={<CommitteeMember detailLink='committee' />} />
                <Route path='/progress' element={<ProjectProgress />} />
                <Route path='/eligible' element={<EligibleGroup />} />
                <Route path='/allocate' element={<Allocate />} />
                <Route path='/external' element={<External />} />
                <Route path='/extension' element={<ExtensionRequest />} />
                <Route path='/notification' element={<Notification user='committee'/>} />
                <Route path='/reset_password/:id/:token' element={<ResetPassword user='committee' />} />
            </Routes>
        </div>
    )
}

export default CommitteeMain