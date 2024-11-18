import React, { useEffect, useState } from 'react';
import Loading from '../Loading';
import SideBar from '../SideBar';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Modal } from 'react-bootstrap';

const StuRequest = (props) => {
    const [requests, setRequests] = useState({
        requests: [{
            projectId: '', description: '', scope: '', supervisorName: ''
        }]
    });
    const [choice, setChoice] = useState({ action: '', id: '' });
    const [loading, setLoading] = useState(false);


    const getRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/student/getRequests', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
            });
            const json = await response.json();
            console.log('json requests is ', json);

            if (json) {
                setRequests(json);
            }
            setLoading(false);
        } catch (error) {
            console.log('error fetching requests', error);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('token')) {
            setTimeout(() => {
                // setLoading(true);
                getRequests();
            }, 1000);
        }
    }, []);

    const handleRequests = async (e, id, action) => {
        try {
            console.log('request is started');
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/student/process-request/${id}/${action}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": token,
                },
            });

            console.log('Response status:', response.status);
            const json = await response.json();
            console.log('json in handle requests is ', json);

            if (json.message && json.success) {
                NotificationManager.success(json.message, '', 1000);
            } else {
                NotificationManager.error(json.message, '', 1000);;
            }
            getRequests();
        } catch (error) {
            console.log('error dealing with requests', error);
            NotificationManager.error(`Some error occured try to reload the page/ try again`, '', 1000);
        }
    };

    return (
        <div>

            {!loading ? (
                <>
                    {requests.requests.length > 0 ? (
                        <div div className="container" style={{ width: '100%' }}>
                            <h3 className="text-center">Requests</h3>
                            <div>
                                <div>
                                    <table className="table table-hover">
                                        <thead style={{ textAlign: 'center' }}>
                                            <tr>
                                                <th scope="col">Supervisor Name</th>
                                                <th scope="col">Project Title</th>
                                                <th scope="col">Description</th>
                                                <th scope="col">Scope</th>
                                                <th scope="col">Accept/Reject</th>
                                            </tr>
                                        </thead>
                                        {requests.requests.map((group, groupKey) => (
                                            <tbody key={groupKey} style={{ textAlign: 'center' }}>
                                                <tr key={groupKey}>
                                                    <td>{group.supervisorName}</td>
                                                    <td>{group.projectTitle}</td>
                                                    <td>{group.description}</td>
                                                    <td>{group.scope}</td>
                                                    <td>
                                                        <div style={{ cursor: 'pointer' }}>
                                                            <div className="d-grid gap-2 d-md-flex">
                                                                <button className="btn btn-success btn-sm me-md-2" type="button" onClick={(e) => {
                                                                    setChoice({ action: 'accept', id: group.projectId });
                                                                    handleRequests(e, group.projectId, 'accept');
                                                                }}>Accept</button>
                                                                <button className="btn btn-warning btn-sm" type="button" onClick={(e) => {
                                                                    setChoice({ action: 'reject', id: group.projectId });
                                                                    handleRequests(e, group.projectId, 'reject');
                                                                }}>Reject</button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        ))}
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <h1 className='text-center' style={{ position: "absolute", transform: "translate(-50%,-50%", left: "50%", top: "50%" }}>You have no requests for now.</h1>
                    )}
                </>
            ) : (
                <Loading />
            )}
        </div>
    );
};

export default StuRequest;