import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Modal } from 'react-bootstrap';
import {server} from '../server'

const External = (props) => {
    const history = useNavigate();
    const [data, setData] = useState({ members: [] });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {

            // Check if any required field is empty
            if (!register.name.trim() || !register.username.trim() || !register.email.trim() || !register.department.trim() || !register.designation.trim()) {
                NotificationManager.error('Please fill in all required fields.');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(register.email)) {
                NotificationManager.warning("Invalid Email Address");
                return;
            }

            console.log('registering ', register)
            const response = await fetch(`${server}/external/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: register.name.trim(),
                    username: register.username.trim(),
                    email: register.email,
                    department: register.department,
                    designation: register.designation,
                })
            });
            const json = await response.json();
            console.log('json in registering', json);
            if (json.success) {
                // Save the auth token and redirect
                localStorage.setItem('token', json.token);
                NotificationManager.success('Registration Successful');
                getMembers();
                setShow(false)
                // Clear the register form fields
                setRegister({
                    name: "", username: "", email: "", department: "", designation: ""
                });
            } else {
                NotificationManager.error(json.message);
            }
        } catch (error) {
            console.log('error is ', error);
        }
    }

    const openEditModal = (supervisor) => {
        setSelectedSupervisor(supervisor);
        setEditMode(true); // Set edit mode when opening the modal
        setRegister({
            name: supervisor.name, username: supervisor.username, email: supervisor.email, department: supervisor.department, designation: supervisor.designation
        });
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            console.log('Register state:', register); // Debugging statement
            if (!register.name || !register.username || !register.email) {
                NotificationManager.error('Please fill in all required fields.');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(register.email)) {
                NotificationManager.warning("Invalid Email Address");
                return;
            }

            const id = selectedSupervisor._id;
            const response = await fetch(`${server}/external/edit/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: register.name.trim(),
                    username: register.username.trim(),
                    email: register.email,
                    department: register.department,
                    designation: register.designation,
                })
            });

            const updatedSupervisor = await response.json(); // Await the response here
            if (updatedSupervisor.success) {
                // Update the state immediately with the edited data
                getMembers();
                NotificationManager.success('Edited Successfully');
                setShow(false)
                setEditMode(false); // Disable edit mode after successful edit
                setRegister({
                    name: '', username: '', email: '', department: "", designation: ""
                });
            } else {
                NotificationManager.error(updatedSupervisor.message);
            }
        } catch (error) {
            console.log('Error:', error); // Log the error message
            NotificationManager.error('Error in Editing');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this supervisor?');
        if (confirmed) {
            try {
                const response = await fetch(`${server}/external/delete/${id}`, {
                    method: "DELETE"
                });
                const json = await response.json();
                console.log('json in deleting supervisor is ', json)
                if (response.status === 200) {
                    // Update the UI by removing the deleted supervisor from the data
                    setData((prevData) => ({
                        ...prevData,
                        members: prevData.members.filter((member) => member._id !== id),
                    }));
                    if (json.success)
                        NotificationManager.success('Deleted Successfully');
                    if (!json.success) {
                        NotificationManager.success(json.message);
                    }
                }
            } catch (error) {
                console.log('Error:', error); // Log the error message
                NotificationManager.error('Error in Deleting');
            }
        }
    };

    const getMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await axios.get(`${server}/external/get-externals`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.data;
            console.log('supervisors are ', json); // Log the response data to see its structure
            setData(json);
        } catch (error) {
            console.log('error in fetching supervisor ', error);
        }
    }

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            history('/');
        } else {
            // Set loading to true when starting data fetch
            setLoading(true);
            getDetail();
            getMembers()
                .then(() => {
                    // Once data is fetched, set loading to false
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false); // Handle error cases
                    console.error('Error fetching data:', error);
                });
        }
    }, []);

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredData = data.members.filter((member) =>
        member.name.toLowerCase().trim().includes(searchQuery.toLowerCase().trim()) ||
        member.username.toLowerCase().trim().includes(searchQuery.toLowerCase().trim()) ||
        member.email.toLowerCase().trim().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().trim().includes(searchQuery.toLowerCase().trim()) ||
        member.designation.toLowerCase().trim().includes(searchQuery.toLowerCase().trim())
    );

    const [register, setRegister] = useState({
        name: "", username: "", email: "", department: "", designation: ""
    });

    const handleChange1 = (e) => {
        const { name, value } = e.target;
        if (name === 'username') {
            // Ensure alphanumeric characters only (no spaces)
            const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '');
            setRegister({ ...register, [name]: alphanumericValue });
        }
        else if (name === 'name') {
            // Allow only one space between words and trim spaces at the beginning and end
            const trimmedValue = value
                .replace(/[^A-Za-z ]/g, '') // Remove characters other than A-Z, a-z, and space
                .replace(/\s+/g, ' ');;
            setRegister({ ...register, [name]: trimmedValue });
        } else {
            setRegister({ ...register, [name]: value });
        }
    };

    const handleClose = () => {
        setRegister({ name: "", username: "", email: "", department: "", designation: "" })
    }

    const paginate = (array, page_size, page_number) => {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    };

    const filteredDataPaginated = paginate(filteredData, recordsPerPage, currentPage);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredData.length / recordsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const getDetail = async () => {
        try {
            setLoading(true);
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

            if (!response.ok) {
                console.log('error fetching detail', response);
                return; // Exit early on error
            }

            const json = await response.json();
            console.log('json is in sidebar: ', json);
            if (json) {
                //   console.log('User data is: ', json);
                setUserData(json);
                setLoading(false)
            }
        } catch (err) {
            console.log('error is in sidebar: ', err);
        }
    };

    const location = useLocation();
    const [userData, setUserData] = useState({ member: [] })
    const pathsWithoutSidebar = ['/', '/committeeMain', '/committeeMain/members', '/committeeMain/student', '/committeeMain/external'];

    // Check if the current location is in the pathsWithoutSidebar array
    const showSidebar = pathsWithoutSidebar.includes(location.pathname);

    const style = `
  .heading {
    text-align: center;
    margin-top: 40px;
  }

  .form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .mb-3 {
    margin-bottom: 15px;
  }

  .btn-secondary {
    background-color: white;
    color: black;
  }

  .btn-register {
    background-color: maroon;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-formregister{
    background-color:maroon;
    color:white;
  }
  
`;

    const [file, setFile] = useState(null);
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event, userType) => {
        event.preventDefault();

        if (!file) {
            alert('Please select an Excel file.');
            return;
        }

        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            const response = await fetch(`${server}/upload/${userType}`, {
                method: 'POST',
                body: formData,
            });

            const json = await response.json();
            if (json.success) {
                NotificationManager.success(json.message, '', 3000);
                getMembers();
            } else {
                NotificationManager.error(json.message, '', 3000);
            }
            setShowUpload(false)
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const [show, setShow] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    return (
        <>
            <div className="UploadFile"  >
                <Modal show={showUpload} onHide={() => {
                    setShowUpload(false);
                }}>
                    <Modal.Header>
                        <Modal.Title className="modal-title" >Export Data From File</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modal-body">
                        <form onSubmit={(e) => handleSubmit(e, 'External')}>

                            <div className="mb-3">
                                <label htmlFor="remrks" className="form-label">File</label>
                                <small>Type should be : .xls/.xlsx <br /> Excel file should contain name ,username and email.- Data must be unique</small> <br />
                                <input type="file" onChange={handleFileChange} accept=".xls, .xlsx" />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => { setFile(null); setShowUpload(false); }}>Close</button>
                                <button type="submit" className="btn btn-success" disabled={!file}> Upload </button>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
            {/* REGISTER */}
            <div className="register">
                <style>{style}</style>
                <Modal show={show} onHide={() => {
                    setShow(false);
                }}>
                    <Modal.Header className="modal-header">
                        <Modal.Title className="modal-title">{!editMode ? "Register" : "Edit"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modal-body">
                        <form onSubmit={editMode ? handleEdit : handleRegister}>
                            <div className="col">
                                <label htmlFor="name" className="form-label">
                                    Name
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fas fa-user"></i>
                                    </span>
                                    <input
                                        type="text"
                                        minLength={3}
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        required={true}
                                        value={register.name}
                                        onChange={handleChange1}
                                    />
                                </div>
                            </div>
                            <div className="col">
                                <label htmlFor="username" className="form-label">
                                    Username
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fas fa-user"></i>
                                    </span>
                                    <input
                                        type="text"
                                        minLength={3}
                                        className="form-control"
                                        id="username"
                                        name="username"
                                        required={true}
                                        value={register.username}
                                        onChange={handleChange1}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="department" className="form-label">
                                    {" "}
                                    Department{" "}
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text"><i className="fas fa-building"></i></span>
                                    <select
                                        type="text"
                                        className="form-control"
                                        id="department"
                                        name="department" required={true}
                                        value={register.department}
                                        onChange={handleChange1}
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Other">other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="designation" className="form-label">
                                    {" "}
                                    Designation{" "}
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fas fa-user-tie"></i>
                                    </span>
                                    <select
                                        className="form-select"
                                        id="designation"
                                        name="designation" required={true}
                                        value={register.designation}
                                        onChange={handleChange1}
                                    >
                                        <option value="Professor">Professor</option>
                                        <option value="Assistant Professor">
                                            Assistant Professor
                                        </option>
                                        <option value="Lecturer">Lecturer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col">
                                <label htmlFor="name" className="form-label">
                                    Email
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i class="fa-regular fa-envelope"></i>
                                    </span>
                                    <input
                                        type="email"
                                        required={true}
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={register.email}
                                        onChange={handleChange1}
                                    />
                                </div>
                            </div>
                            <Modal.Footer className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => { setEditMode(false); handleClose(); setShow(false) }}>Close</button>
                                {editMode ? (
                                    <button type="submit" className="btn btn-primary" disabled={!register.name || !register.username || !register.email}>Save Changes</button>
                                ) : (
                                    <button type="submit" className="btn btn-success" disabled={!register.name || !register.username || !register.email}>
                                        Register
                                    </button>
                                )}
                            </Modal.Footer>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {loading ? (<Loading />) : (
                <>
                    <div className='container'>
                        <h3 className='text-center'>External Members</h3>
                        <div className="mb-3">
                            <label htmlFor="recordsPerPage" className="form-label">Records per page:</label>
                            <select id="recordsPerPage" className="form-select" value={recordsPerPage} onChange={(e) => {
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
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search....."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                        {filteredDataPaginated.length > 0 ? (
                            <table className="table table-hover" style={{ textAlign: "center" }}>
                                <thead>
                                    <tr>
                                        <th scope="col">Name</th>
                                        <th scope="col">Username</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Department</th>
                                        <th scope="col">Designation</th>
                                        {(!showSidebar || userData.member.isAdmin) && <>
                                            <th scope="col">Edit</th>
                                            <th scope="col">Remove</th>
                                        </>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDataPaginated.map((val, key) => (
                                        <tr key={key}>
                                            <td>{val.name}</td>
                                            <td>{val.username}</td>
                                            <td>{val.email}</td>
                                            <td>{val.department?val.department:""}</td>
                                            <td>{val.designation?val.designation:""}</td>
                                            {(userData.member.isAdmin) &&
                                                <>
                                                    <td data-toggle="modal" data-target="#exampleModal">
                                                        <button onClick={() => { openEditModal(val); setShow(true); }} className="btn" style={{ color: "white", cursor: "pointer", background: "maroon" }}>
                                                            <i className="fa-solid fa-pen-to-square"></i>
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button onClick={() => handleDelete(val._id)} className="btn" style={{ color: "white", cursor: "pointer", background: "maroon" }} > <i className="fa-solid fa-trash"></i></button></td>
                                                </>
                                            }
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div>No matching members found.</div>
                        )}
                        <div className="d-flex justify-content-between">
                            <button type="button" className="btn btn-success" disabled={currentPage === 1} onClick={handlePrevPage}
                            >  Previous </button>
                            <button type="button" className="btn btn-success" disabled={currentPage === Math.ceil(filteredData.length / recordsPerPage)} onClick={handleNextPage}
                            >  Next </button>
                        </div>
                    </div>
                    {(userData.member.isAdmin) && <div className="d-grid gap-2 col-6 mx-auto my-4">
                        <button style={{ background: "maroon" }} type="button" className="btn btn-danger mx-5" onClick={() => { setEditMode(false); handleClose(); setShow(true) }}>
                            Register
                        </button>
                        <button
                            style={{ background: "maroon" }}
                            type="button"
                            className="btn btn-danger mx-5"
                            onClick={() => {
                                setFile(null);
                                setShowUpload(true);
                            }}
                        >
                            Register Externals From File
                        </button>
                    </div>}

                    <NotificationContainer />
                </>
            )}
        </>
    )
}

export default External;