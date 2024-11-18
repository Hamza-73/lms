import React, { useEffect, useState } from 'react';
import '../../css/progress.css';
import graph from '../../images/graph.png';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Loading from '../Loading';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts';
import { Modal } from 'react-bootstrap';
import StuRequest from './StuRequest';

const Progress = (props) => {

    const [percentage, setPercentage] = useState(25);
    const [meetingReport, setMeetingReport] = useState([
        {
            date: "2023-10-1",
            review: true,
            value: 4
        },
        {
            date: "2023-9-4",
            review: false,
            value: 2
        },
        {
            date: "2023-10-15",
            review: false,
            value: 5
        },
        {
            date: "2023-9-4",
            review: false,
            value: 2
        },
        {
            date: "2023-8-5",
            review: true,
            value: 5
        },
        {
            date: "2023-11-5",
            review: true,
            value: 5
        },

    ]);

    const [chartData, setChartData] = useState([]);

    const parseDate = (dateString) => {
        const dateObj = new Date(dateString);
        const month = dateObj.getMonth() + 1; // Adding 1 because months are 0-based
        const year = dateObj.getFullYear();
        return `${month}-${year}`;
    };

    useEffect(() => {
        // Transform meetingReport data to get counts for each month
        const transformedData = meetingReport.reduce((acc, meeting) => {
            const monthYear = parseDate(meeting.date);

            if (!acc[monthYear]) {
                acc[monthYear] = { trueCount: 0, falseCount: 0, monthYear }; // Include monthYear property
            }

            if (meeting.review) {
                acc[monthYear].trueCount++;
            } else {
                acc[monthYear].falseCount++;
            }

            return acc;
        }, {});

        // Convert the object back to an array
        const chartData = Object.values(transformedData);
        console.log('Transformed Data:', chartData);
        setChartData(chartData);
    }, [meetingReport]);


    const [request, setRequest] = useState({
        username: '', projectTitle: '',
        description: '', scope: '', status: false,
    });
    const [groupDetails, setGroupDetails] = useState({});
    const [loading, setLoading] = useState(false);


    const sendRequest = async (e) => {
        try {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await fetch(`http://localhost:5000/student/send-project-request`, {
                method: 'POST', // Change to POST
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
                body: JSON.stringify({
                    username: request.username,
                    projectTitle: request.projectTitle.toLowerCase(), description: request.description,
                    scope: request.scope, status: false,
                }),
            });
            const json = await response.json();
            if (json.success && json.message) {
                handleClose();
                setShow(false);
                NotificationManager.success(json.message);
            } else {
                NotificationManager.error(json.message);
            }
        } catch (error) {
            console.log('error is ', error);
            alert(`Some error occurred: ${error.message}`, 'danger');
        }
    };

    const groupDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await fetch('http://localhost:5000/student/my-group', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
            });

            const json = await response.json();
            if (json) {
                console.log('group detail is ', json);
                setGroupDetails(json);
                setMeetingReport(json.group.meetings); // Set meetingReport state with the fetched data
            }
            if (json.success && json.message) {
                NotificationManager.success(json.message);
            }
        } catch (error) {
            console.log('error in fetching progress', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name !== 'username') {
            let trimmedValue = value.replace(/\s+/g, ' '); // Remove consecutive spaces and non-alphabetic characters
            trimmedValue = trimmedValue.replace(/[^a-zA-Z\s]/g, '');
            setRequest((prevData) => ({
                ...prevData,
                [name]: trimmedValue,
            }));
        } else {
            setRequest((prevData) => ({
                ...prevData,
                [name]: e.target.value,
            }));
        }
    };

    useEffect(() => {
        setLoading(true);
        if (localStorage.getItem('token')) {
            setTimeout(() => {
                groupDetail();
                setLoading(false);
                getMembers();
            }, 1300);
        }
    }, []);

    useEffect(() => {
        if (groupDetails.group) {
            let updatedPercentage = 25; // Initialize with a base value

            if (groupDetails.group.proposal) {
                updatedPercentage += 25;
            }
            if (groupDetails.group.documentation) {
                updatedPercentage += 30;
            }
            if (groupDetails.group.marks > 0) updatedPercentage += 20;

            setPercentage(updatedPercentage);
        }
    }, [groupDetails]);

    const handleClose = () => {
        setRequest({
            username: '', projectTitle: '',
            description: '', scope: '', status: false,
        });
    }

    const [show, setShow] = useState(false);

    const [data, setData] = useState({ members: [] });
    const getMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await fetch("http://localhost:5000/supervisor/get-supervisors", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();
            console.log('supervisors are ', json); // Log the response data to see its structure
            setData(json);
        } catch (error) {
            console.log('error in fetching supervisor ', error);
        }
    }

    return (
        <>
            {!loading ? (
                <>
                    <Modal show={show} onHide={() => {
                        setShow(false);
                    }}>
                        <Modal.Header>
                            <Modal.Title>
                                Your Request
                            </Modal.Title>
                        </Modal.Header>
                        <div className="modal-body">
                            <>
                                <form onSubmit={sendRequest}>
                                    <div className="mb-3">
                                        <label htmlFor="exampleInputEmail163" className="form-label">
                                            Supervisor Username
                                        </label>
                                        <select name="username" value={request.username} onChange={handleChange} className='form-select' id="">
                                            <option value="">Select Supervisor</option>
                                            {
                                                data.members && data.members.filter((sup) =>
                                                    sup.slots > 0
                                                ).map((supervisor, key) => {
                                                    return (<><option key={key} value={supervisor.username}>{supervisor.name}</option></>)
                                                })
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleInputPassword331" className="form-label">
                                            Project Title
                                        </label>
                                        <input type="text" className="form-control" id="projectTitle" name="projectTitle" value={request.projectTitle} onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleInputPassword13" className="form-label">
                                            Scope of Study
                                        </label>
                                        <input type="text" className="form-control" id="scope" name="scope" value={request.scope} onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleInputPassword153" className="form-label">
                                            Description
                                        </label>
                                        <div className="form-floating">
                                            <textarea className="form-control" id="description" name="description" value={request.description} onChange={handleChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <Modal.Footer>
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close"
                                            onClick={() => {
                                                handleClose(); setShow(false);
                                            }}
                                        > Close</button>
                                        <button type="submit"
                                            className="btn"
                                            style={{ background: 'maroon', color: 'white' }}
                                            disabled={!request.projectTitle || !request.scope || !request.description}
                                        >
                                            Send Request
                                        </button>
                                    </Modal.Footer>
                                </form>
                            </>
                        </div>
                    </Modal>
                    {groupDetails.group ? (
                        <>
                            <div className="container d-flex">
                                <div className="d-flex mx-6" style={{ position: "relative", marginLeft: "10%" }}>
                                    <div className="my-3 box mx-4 text-center" style={{ height: "300px" }}>
                                        <h3>Meeting Progress</h3> {meetingReport.length > 0 && <small>Meeting {meetingReport.length}</small>}
                                        {meetingReport.length > 0 ? <BarChart style={{ marginLeft: "20px" }} width={350} height={200} data={chartData} maxBarSize={50}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="monthYear" />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="trueCount" fill="red" name="Successful" />
                                            <Bar dataKey="falseCount" fill="blue" name="Unsuccessful" />
                                        </BarChart>

                                            : <h4 className='my-6'>No Meetings Yet</h4>}

                                    </div>
                                    <div className="box my-3 mx-4" style={{ height: "300px" }}>
                                        <h3>Project Report</h3>
                                        <div style={{ width: '190px', marginLeft: '25%' }}>
                                            <CircularProgressbar value={percentage} text={`${percentage}%`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                <h4>Task</h4>
                                            </th>
                                            <th>
                                                <h4>Status</h4>
                                            </th>
                                            <th>
                                                <h4>Due Date</h4>
                                            </th>
                                            <th>
                                                <h4>Submission Date</h4>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Proposal</td>
                                            <td>{groupDetails.group.proposal ? 'Submitted' : 'Pending'}</td>
                                            <td>{groupDetails.group.propDate ? new Date(groupDetails.group.propDate).toLocaleDateString('en-US') : '---'}</td>
                                            <td>{groupDetails.group.propSub ? groupDetails.group.propSub : '---'}</td>
                                        </tr>
                                        <tr>
                                            <td>Project Documentation</td>
                                            <td>{groupDetails.group.documentation ? 'Submitted' : 'Pending'}</td>
                                            <td>{groupDetails.group.docDate ? new Date(groupDetails.group.docDate).toLocaleDateString('en-US') : '---'}</td>
                                            <td>{groupDetails.group.docSub ? groupDetails.group.docSub : '---'}</td>
                                        </tr>
                                        <tr>
                                            <td>Viva</td>
                                            <td>
                                                {
                                                    groupDetails.group.vivaDate ?
                                                        (
                                                            !groupDetails.group.isViva ?
                                                                new Date(groupDetails.group.vivaDate).toISOString().split('T')[0] :
                                                                "Taken"
                                                        ) :
                                                        "Pending"
                                                }
                                            </td>
                                            <td>{'-----'}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                        <tr>
                                            <td>Marks</td>
                                            <td>
                                                {(groupDetails.group.marks && groupDetails.group.externalMarks && groupDetails.group.hodMarks) ? (groupDetails.group.marks + groupDetails.group.externalMarks + groupDetails.group.hodMarks) / 3 : 0}
                                            </td>
                                            <td>{'-----'}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <h1 className="text-center my-3" style={{ position: "absolute", transform: "translate(-50%,-50%", left: "50%", top: "50%" }}>You're not currently enrolled in any Group</h1>
                    )}
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end buttonCls">
                        <button
                            type="button"
                            style={{ background: 'maroon', position: "relative", marginTop: "45px" }}
                            className="btn btn-danger"
                            disabled={groupDetails.group}
                            onClick={() => {
                                setShow(true);
                            }}
                        >
                            Request Idea
                        </button>
                    </div>
                </>
            ) : (
                <Loading />
            )}
        </>
    );
};

export default Progress;