import React, { useState, useEffect } from 'react';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import SideBar from '../SideBar';
import {server} from '../server'

const FypIdeas = () => {
    const [group, setGroup] = useState({
        success: false,
        projectDetails: [
            {
                projectDetails: {
                    _id: '', students: [''], projectTitle: '', description: '',
                    scope: '', status: false,
                },
                supervisor: null, supUsername: null,
                studentsDetail: [{ name: '', rollNo: '', username: '' }],
            },
        ],
    });
    const [loading, setLoading] = useState(false);
    const [numRows, setNumRows] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [projectTitle, setProject] = useState('');

    const [groupDetails, setGroupDetails] = useState({
        success: false,
        group: {
            myDetail: [{ name: '', rollNo: '', myId: '' }],
            groupId: '', supervisor: '', supervisorId: '', projectTitle: '',
            projectId: '',
            groupMember: [{ userId: '', name: '', rollNo: '', _id: '' }],
            proposal: false, documentation: false, docDate: '----', propDate: '----', viva: '-----',
        },
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [expandedGroups, setExpandedGroups] = useState([]);

    const paginate = (array, page_size, page_number) => {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredGroups.length / recordsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const toggleExpand = (groupIndex) => {
        const updatedExpandedGroups = [...expandedGroups];
        updatedExpandedGroups[groupIndex] = !expandedGroups[groupIndex];
        setExpandedGroups(updatedExpandedGroups);
    };

    const truncateText = (text, maxWords) => {
        const words = text.split(' ');
        if (words.length <= maxWords) {
          return text;
        }
        return words.slice(0, maxWords).join(' ') + '....';
      };
    useEffect(() => {
        const getGroup = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Authorization token not found', 'danger');
                    return;
                }
                console.log('before fetch');
                const response = await fetch(`${server}/student/my-group`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token,
                    },
                });
                console.log('after fetch');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const json = await response.json();
                if (!json) {
                    console.log('group response is ', response);
                } else {
                    console.log('json is in group details', json);
                    setGroupDetails(json);
                }
            } catch (error) {
                console.log('error fetching group ', error);
            }
        };

        const getAvailableGroups = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${server}/projects/projects`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const json = await response.json();
                console.log('json in fyp is ', json);
                if (json.success) {
                    setGroup(json);
                    setFilteredGroups(json.projectDetails);
                } else {
                    alert(json.message);
                }
            } catch (error) {
                console.log(`error in getting ideas ${error}`);
            } finally {
                setLoading(false);
            }
        };
        if (localStorage.getItem('token')) {
            setLoading(true);
            setTimeout(() => {
                getGroup();
                getAvailableGroups();
                setLoading(false);
                console.log('group', group);
            }, 1000);
        }
    }, []);

    const sendRequest = async (title) => {
        try {
            console.log('project is ', title);
            const encodedTitle = encodeURIComponent(title);
            const token = localStorage.getItem('token');
            const response = await fetch(`${server}/student/request-to-join/${encodedTitle}`, {
                method: 'POST',
                headers: {
                    Authorization: token,
                },
            });
            const json = await response.json();
            console.log('json request sent is ', json);
            if (json.success && json.message) {
                NotificationManager.success(json.message);
            } else {
                NotificationManager.error(json.message);
            }
        } catch (error) {
            console.log(`error in sending request ${error}`);
        }
    };

    const handleSearchInputChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredGroups(group.projectDetails);
        } else {
            filterGroups(query);
        }
        setCurrentPage(1);
    };

    const filterGroups = (query) => {
        if (group.projectDetails) {
            const filtered = group.projectDetails.filter((group) => {
                const lowerQuery = query.toLowerCase();
                return (
                    group.studentsDetail.some((student) => student.name.toLowerCase().includes(lowerQuery)) ||
                    (group.supervisor && group.supervisor.toLowerCase().includes(lowerQuery)) ||
                    (group.supUsername && group.supUsername.toLowerCase().includes(lowerQuery)) ||
                    group.projectDetails.projectTitle.toLowerCase().includes(lowerQuery) ||
                    group.projectDetails.description.toLowerCase().includes(lowerQuery) ||
                    group.projectDetails.scope.toLowerCase().includes(lowerQuery)
                );
            });
            setFilteredGroups(filtered);
        }
    };

    const filteredDataPaginated = paginate(filteredGroups, recordsPerPage, currentPage);

    return (
        <>
            {!loading ? (
                <div>
                    {group.projectDetails ? (
                        <>
                            <h3 className='text-center my-4'>FYP Available Groups</h3>
                            <div className='container' style={{ width: '100%' }}>
                                <div>
                                    <div>
                                        <div className='mb-3'>
                                            <label htmlFor='recordsPerPage' className='form-label'>
                                                Records per page:
                                            </label>
                                            <select
                                                id='recordsPerPage'
                                                className='form-select'
                                                value={recordsPerPage}
                                                onChange={(e) => {
                                                    setRecordsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className='mb-3'>
                                            <input
                                                type='text'
                                                className='form-control text-center'
                                                placeholder='Search by name, supervisor, username, or project title'
                                                value={searchQuery}
                                                onChange={handleSearchInputChange}
                                            />
                                        </div>
                                        <table className='table table-hover'>
                                            <thead style={{ textAlign: 'center' }}>
                                                <tr>
                                                    <th scope='col'>Students</th>
                                                    <th scope='col'>Supervisor</th>
                                                    <th scope='col'>Supervisor Username</th>
                                                    <th scope='col'>Project Title</th>
                                                    <th scope='col'>Scope</th>
                                                    <th scope='col'>Description</th>
                                                    <th scope='col'>Join Group</th>
                                                </tr>
                                            </thead>
                                            <tbody className='text-center'>
                                                {filteredDataPaginated.map((group, groupIndex) => (
                                                    <tr key={groupIndex}>
                                                        <td>
                                                            {group.studentsDetail.length > 0 ? (
                                                                group.studentsDetail.map((student, studentKey) => (
                                                                    <React.Fragment key={studentKey}>
                                                                        {!student.name ? 'No Student Yet' : student.name}
                                                                        <br />
                                                                    </React.Fragment>
                                                                ))
                                                            ) : (
                                                                'No Students yet'
                                                            )}
                                                        </td>
                                                        <td>{group.supervisor === null ? 'No Supervisor Yet' : group.supervisor}</td>
                                                        <td>{group.supUsername === null ? 'No Supervisor Yet' : group.supUsername}</td>
                                                        <td>{group.projectDetails.projectTitle}</td>
                                                        <td>
                                                            <div
                                                                onClick={() => toggleExpand(groupIndex)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                {expandedGroups[groupIndex]
                                                                    ? group.projectDetails.scope
                                                                    : (
                                                                        <>
                                                                            {truncateText(group.projectDetails.scope, 3)}
                                                                        </>
                                                                    )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div
                                                                onClick={() => toggleExpand(groupIndex)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                {expandedGroups[groupIndex]
                                                                    ? group.projectDetails.description
                                                                    : (
                                                                        <>
                                                                            {truncateText(group.projectDetails.description, 3)}
                                                                        </>
                                                                    )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <button
                                                                type='button'
                                                                className='btn btn-sm'
                                                                disabled={groupDetails.group.groupId || group.supervisor === null || !group.projectDetails.active}
                                                                style={{ background: 'maroon', color: 'white' }}
                                                                onClick={() => {
                                                                    setProject(group.projectDetails.projectTitle);
                                                                    sendRequest(group.projectDetails.projectTitle);
                                                                }}
                                                            >
                                                                request to join
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <button
                                        type='button'
                                        className='btn btn-success'
                                        disabled={currentPage === 1}
                                        onClick={handlePrevPage}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        type='button'
                                        className='btn btn-success'
                                        disabled={currentPage === Math.ceil(filteredGroups.length / recordsPerPage)}
                                        onClick={handleNextPage}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                        </>
                    ) : (
                        <h2 className='text-center' style={{ position:"absolute", transform: "translate(-50%,-50%", left:"50%", top:"50%" }}>Currently No Project Idea/ Group is Available.</h2>
                    )}
                </div>
            ) : (
                <Loading />
            )}

            <NotificationContainer />
        </>
    );
};

export default FypIdeas;