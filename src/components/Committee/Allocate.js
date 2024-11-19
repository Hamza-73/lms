import React, { useState, useEffect } from 'react'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Loading from '../Loading';
import {server} from '../server'

const Allocate = () => {

    const [allocate, setAllocate] = useState({
        projectTitle: '', newSupervisor: ''
    });

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState({
        list: [{
            groupName: "", date: "", time: "",
            previousSupervisor: [{
                id: "", name: ""
            }],
            newSupervisor: [{
                id: "", name: ""
            }],
        }]
    });

    const handleChange = (e) => {
        setAllocate({ ...allocate, [e.target.name]: [e.target.value] });
    }

    const [userData, setUserData] = useState({ member: [] });

    const getDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('token not found');
                return;
            }

            const response = await fetch(`${server}/committee/detail`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                },
            });

            const json = await response.json();
            console.log('json is in sidebar: ', json);
            if (json) {
                //   console.log('User data is: ', json);
                setUserData(json);
            }
        } catch (err) {
            console.log('error is in sidebar: ', err);
        }
    };

    const AllocateSupervisor = async (e) => {
        try {
            e.preventDefault();
            const response = await fetch(`${server}/committee/allocate-group`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ projectTitle: allocate.projectTitle, newSupervisor: allocate.newSupervisor })
            });
            const json = await response.json();
            if (json.success) {
                NotificationManager.success(json.message);
                getList();
            } else {
                NotificationManager.error(json.message);
            }
            setAllocate({
                projectTitle: "", newSupervisor: ""
            })
        } catch (error) {

        }
    }

    const [data, setData] = useState({ members: [] });
    const getMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await fetch(`${server}/supervisor/get-supervisors`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();
            console.log('supervisors are ', json); // Log the response data to see its structure
            setData(json);
        } catch (error) {
        }
    }

    const getList = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${server}/allocation/list`, {
                method: "GET"
            });
            const json = await response.json();
            console.log('json in list is ', json);
            setList(json);
            setLoading(false);
        } catch (error) {
            console.log('error in getting list ', error);
        }
    }

    useEffect(() => {
        getDetail();
        getList();
        getMembers();
        getProjects();
    }, []);

    const [projects, setProjects] = useState([]);
    const getProjects = async () => {
        try {
            const response = await fetch(`${server}/allocation/groups`, {
                method: "GET"
            });
            const json = await response.json();
            console.log('group are ', json);
            setProjects(json);
        } catch (error) {

        }
    }

    return (
        <>
            <>
                {userData.member.isAdmin && <div>
                    <h1 className='text-center my-4'>Allocate Group</h1>
                    <form onSubmit={(e) => AllocateSupervisor(e)} className='container' style={{ border: "none" }}>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label"> <h5>Title</h5></label>
                            <select name="projectTitle" className='form-select' id="" value={allocate.projectTitle} onChange={handleChange}>
                                <option value="">Select Group</option>
                                {
                                    projects && projects.map((project) => {
                                        return (<option key={project} value={project}>{project}</option>)
                                    })
                                }
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="newSupervisor" className="form-label"> <h5>New Supervisor's Username</h5></label>
                            <select className='form-select' id="newSupervisor" name='newSupervisor' value={allocate.newSupervisor} onChange={handleChange}>
                                <option value="">Select Supervisor</option>
                                {data.members.map((supervisor, index) => (
                                    <option key={index} value={supervisor.username}>{supervisor.username}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" class="btn" style={{ background: "maroon", color: "white" }}
                            disabled={!allocate.newSupervisor || !allocate.projectTitle}
                        >Allocate</button>
                    </form>
                    <NotificationContainer />
                </div>}
            </>
            {loading ? (
                <Loading />
            ) : (
                <>
                    {list.list && list.list.length > 0 && <div className="container" style={{ width: "100%" }}>
                        <h3 className="text-center">Allocation Histroy</h3>
                        <table className="table table-hover text-center">
                            <thead>
                                <tr>
                                    <th scope="col">Group</th>
                                    <th scope="col">Previous Supervisor</th>
                                    <th scope="col">New Supervisor</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Time</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {list.list.map((val, key) => (
                                    <tr key={key}>
                                        <td>{val.groupName}</td>
                                        <td>{val.previousSupervisor[0].name}</td>
                                        <td>{val.newSupervisor[0].name}</td>
                                        <td>{val.date}</td>
                                        <td>{val.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
                    <NotificationContainer />
                </>
            )}
        </>
    )
}

export default Allocate
