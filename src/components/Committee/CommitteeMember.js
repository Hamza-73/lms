import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../Loading";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { Modal } from "react-bootstrap";
import {server} from '../server'

const CommitteeMember = (props) => {
  const history = useNavigate();
  const [userData, setUserData] = useState({ member: [] });

  const [data, setData] = useState({ members: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [firstNameLastNameEqual, setFirstNameLastNameEqual] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [register, setRegister] = useState({
    fname: "", lname: "", username: "", department: "", designation: "", password: "", email: "", name: "",
  });


  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  const makeAdmin = async (username) => {
    try {
      const response = await fetch(`${server}/admin/make-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username })
      });
      const json = await response.json();
      console.log('json in making admin is ', json);
      if (json.success) {
        getMembers();
      }
      if (json.message) {
        alert(json.message)
      }

    } catch (error) {

    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Check if any required field is empty
      if (!register.fname.trim() || !register.lname.trim() || !register.username.trim() || !register.department.trim() || !register.designation.trim() || !register.password.trim() || !register.email) {
        NotificationManager.error('Please fill in all required fields.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(register.email)) {
        NotificationManager.warning("Invalid Email Address");
        return;
      }

      const response = await fetch(`${server}/committee/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fname: register.fname.trim(), lname: register.lname.trim(), username: register.username.trim(),
          designation: register.designation.trim(), password: register.password, department: register.department.trim(), email: register.email
        })
      });
      const json = await response.json();
      console.log(json);
      if (json.success) {
        // Save the auth token and redirect
        localStorage.setItem('token', json.token);
        NotificationManager.success('Registration Successful');
        getMembers();
        // Clear the register form fields
        setRegister({
          fname: "", lname: "", username: "", department: "", designation: "", password: "", email: ""
        });
        setShow(false);
      }
      else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      NotificationManager.error('Error in Registering');
    }
  }

  // Function to handle edit
  const handleEdit = async (e) => {
    e.preventDefault();
    try {

      // Check if any required field is empty
      if (!register.fname.trim() || !register.lname.trim() || !register.username.trim() || !register.department.trim() || !register.designation.trim() || !register.email) {
        NotificationManager.error('Please fill in all required fields.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(register.email)) {
        NotificationManager.warning("Invalid Email Address");
        return;
      }

      const id = selectedStudent._id;
      const response = await fetch(`${server}/committee/edit/${id}`,
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fname: register.fname, lname: register.lname, username: register.username,
            designation: register.designation, department: register.department, email: register.email
          })
        }
      );

      const updatedStudent = await response.json();
      if (updatedStudent.success) {
        getMembers();
        console.log('updated student is ', updatedStudent)
        setEditMode(false); // Disable edit mode after successful edit
        setRegister({
          fname: '', lname: '', username: '', department: '', designation: '', password: '', email: ""
        });
        closeModal();
        NotificationManager.success('Edited Successfully');
        setShow(false);
      } else {
        NotificationManager.error(updatedStudent.message);
      }

    } catch (error) {
      console.log('Error:', error); // Log the error message
      NotificationManager.error('Error in Editing');
    }
  };


  // Function to open edit modal
  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditMode(true);
    setRegister({
      fname: student.fname, lname: student.lname, username: student.username, department: student.department,
      designation: student.designation, slots: student.slots, email: student.email
    });
  };


  // Function to handle delete
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete?');
    if (confirmed) {
      try {
        console.log('id is ', id)
        const response = await axios.delete(`${server}/committee/delete/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.status === 200) {
          // Update the UI by removing the deleted student from the data
          setData((prevData) => ({
            ...prevData,
            members: prevData.members.filter((member) => member._id !== id),
          }));
          NotificationManager.success('Deleted Successfully');
        }
      } catch (error) {
        console.log('Error:', error); // Log the error message
        NotificationManager.error('Error in Deleting');
      }
    }
  };

  // Function to get members
  const getMembers = async () => {
    try {
      const response = await axios.get(`${server}/committee/get-members`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.data;
      console.log('students are ', json); // Log the response data to see its structure
      setData(json);
    } catch (error) {
      console.log('some rror occured in fetching members', error)
    }
  }

  const getDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('token not found');
        return;
      }

      const response = await fetch(`${server}/${props.detailLink}/detail`, {
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

// Function to handle input changes
const handleChange1 = (e) => {
  const { name, value } = e.target;
  setFirstNameLastNameEqual(false);

  if (name === 'username') {
    // Ensure alphanumeric characters only (no spaces)
    const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '');
    setRegister({ ...register, [name]: alphanumericValue });
  } else if (name === 'fname' || name === 'lname') {
    // Allow only one space between words and trim spaces at the beginning and end
    const trimmedValue = value
      .replace(/[^A-Za-z ]/g, '') // Remove characters other than A-Z, a-z, and space
      .replace(/\s+/g, ' ');
    setRegister({ ...register, [name]: trimmedValue });

    // Check if both first name and last name are not empty and equal
    if (name === 'fname' && trimmedValue.toLowerCase().trim() === register.lname.toLowerCase().trim() && trimmedValue !== '' && register.lname.toLowerCase().trim() !== '') {
      setFirstNameLastNameEqual(true);
    } else if (name === 'lname' && trimmedValue.toLowerCase().trim() === register.fname.toLowerCase().trim() && trimmedValue !== '' && register.fname.toLowerCase().trim() !== '') {
      setFirstNameLastNameEqual(true);
    }
  } else {
    setRegister({ ...register, [name]: value });
  }
};

  // Function to reset input fields
  const handleClose = () => {
    setRegister({ fname: "", lname: "", name: "", username: "", department: "", designation: "", password: "", email: "" });
  }

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page when performing a new search
  };

  const paginate = (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  };
  const filteredData = data.members.filter((member) => {
    const searchTerm = searchQuery.trim().toLowerCase(); // Remove leading/trailing spaces and convert to lowercase
    const searchWords = searchTerm.split(' ');

    // Check if member object has both "fname" and "lname" properties
    if (member.fname && member.lname) {
      const matchesFirstName = searchWords.some((word) =>
        member.fname.toLowerCase().includes(word)
      );
      const matchesLastName = searchWords.some((word) =>
        member.lname.toLowerCase().includes(word)
      );

      if (matchesFirstName || matchesLastName) {
        return true;
      }
    } else if (member.name) {
      // If member object has only "name" property
      const matchesName = searchWords.some((word) =>
        member.name.toLowerCase().includes(word)
      );

      if (matchesName) {
        return true;
      }
    }

    // Check department and designation properties
    return (
      member.department.toLowerCase().includes(searchTerm) ||
      member.designation.toLowerCase().includes(searchTerm)
    );
  });


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
      setShowUpload(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const location = useLocation();
  const pathsWithoutSidebar = ['/', '/committeeMain', '/committeeMain/members'];

  // Check if the current location is in the pathsWithoutSidebar array
  const showSidebar = pathsWithoutSidebar.includes(location.pathname);
  // states to show modal
  const [show, setShow] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>

      <div className="UploadFile"  >
        <Modal show={showUpload} onHide={() => setShowUpload(false)}>
          <Modal.Header className="modal-header">
            <h5 className="modal-title" >Export Data From File</h5>
                <small>Type should be : .xls/.xlsx <br /> Excel file should contain fname, lname ,username and email.- Data must be unique</small> <br />
          </Modal.Header>
          <Modal.Body className="modal-body">
            <form onSubmit={(e) => handleSubmit(e, 'Committee')}>
              <div className="mb-3">
                <label htmlFor="remrks" className="form-label">File</label>
                <small>File Type should be : .xls/.xlsx</small>
                <input type="file" onChange={handleFileChange} accept=".xls, .xlsx" />
              </div>
              <Modal.Footer className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => { setFile(null); setShowUpload(false) }}>Close</button>
                <button type="submit" className="btn btn-success" disabled={!file}> Upload </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>

      {/* REGISTER */}
      <div className="register">
        <style>{style}</style>
        <Modal
          show={show}
          onHide={() => { setEditMode(false); setShow(false) }}
        >
          <Modal.Header className="modal-header">
            <Modal.Title className="modal-title">{!editMode ? "Register" : "Edit"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <form onSubmit={editMode ? handleEdit : handleRegister}>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="name" className="form-label">
                    First Name
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-user"></i>
                    </span>
                    <input
                      type="text"
                      minLength={3} required={true}
                      className="form-control"
                      id="name"
                      name="fname"
                      value={register.fname}
                      onChange={handleChange1}
                    />
                  </div>
                </div>
                <div className="col">
                  <label htmlFor="name" className="form-label">
                    Last Name
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
                      name="lname" required={true}
                      value={register.lname}
                      onChange={handleChange1}
                    />
                    {firstNameLastNameEqual && (
                      <div className="text-danger">
                        First name and last name should not be same.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label
                  htmlFor="exampleInputusername1"
                  className="form-label"
                >
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
                    id="exampleInputusername2"
                    name="username" required={true}
                    value={register.username}
                    onChange={handleChange1}
                  />
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
                    className="form-control"
                    id="email"
                    name="email" required={true}
                    value={register.email}
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
              {!editMode ? (
                <div className="mb-3">
                  <label
                    htmlFor="exampleInputPassword1"
                    className="form-label"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    className="form-control"
                    id="exampleInputPassword2"
                    name="password" required={true}
                    value={register.password}
                    onChange={handleChange1}
                  />
                  <small>
                    password should be of at least 6 characters{" "}
                  </small>
                </div>
              ) : (
                ""
              )}
              <Modal.Footer className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={() => {
                    handleClose();
                    setShow(false);
                  }}
                >
                  Close
                </button>
                {editMode ? (
                  <button
                    type="submit"
                    className="btn"
                    style={{ background: "maroon", color: "white" }}
                    disabled={
                      !register.fname ||
                      !register.lname ||
                      !register.username ||
                      !register.department || firstNameLastNameEqual
                    }
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-formregister"
                    disabled={
                      !register.fname ||
                      !register.lname ||
                      !register.username ||
                      !register.department || firstNameLastNameEqual
                    }
                  >
                    Register
                  </button>
                )}
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="container">
            <h3 className="text-center">Committee Members</h3>
            <div className="mb-3">
              <label htmlFor="recordsPerPage" className="form-label">
                Records per page:
              </label>
              <select
                id="recordsPerPage"
                className="form-select"
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to the first page when changing the number of records per page
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
              <table className="table table-hover text-center" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Department</th>
                    <th scope="col">Designation</th>
                    {(!showSidebar && !userData.member.isAdmin) && (
                      <>
                        <th scope="col">Edit</th>
                        <th scope="col">Remove</th>
                        <th scope="col">Make Admin</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className='text-center'>
                  {filteredDataPaginated.map((val, key) => (
                    <tr key={key}>
                      <td>{val.fname ? val.fname + ' ' + val.lname : <>{val.name} <small>(sup)</small></>}</td>
                      <td>{val.department}</td>
                      <td>{val.designation}</td>
                      {!showSidebar && !userData.member.isAdmin && ( // Conditionally render Edit and Remove columns
                        <>
                          <td
                            style={{ cursor: "pointer" }}
                          >
                            <button
                              onClick={() => { openEditModal(val); setShow(true) }}
                              disabled={val.isAdmin || val.isCommittee} className="btn" style={{ background: "maroon", color: "white" }}>
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                          </td>
                          <td style={{ cursor: "pointer", color: "maroon", textAlign: "center", fontSize: "25px" }}>
                            <button onClick={() => handleDelete(val._id)} className="btn" style={{ background: "maroon", color: "white" }}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                          <td>
                            <button className="btn btn-sm" style={{ background: "maroon", color: "white" }}
                              disabled={val.isAdmin}
                              onClick={() => {
                                makeAdmin(val.username)
                              }}
                            >
                              Make Converner
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>No result found</div>
            )}
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-success"
                disabled={currentPage === 1}
                onClick={handlePrevPage}
              >
                {" "}
                Previous{" "}
              </button>
              <button
                type="button"
                className="btn btn-success"
                disabled={
                  currentPage ===
                  Math.ceil(filteredData.length / recordsPerPage)
                }
                onClick={handleNextPage}
              >
                {" "}
                Next{" "}
              </button>
            </div>
          </div>
          {(!showSidebar && !userData.member.isAdmin) && <div className="d-grid gap-2 col-6 mx-auto my-4">
            <button
              style={{ background: "maroon" }}
              type="button"
              className="btn btn-danger mx-5"
              onClick={() => {
                setEditMode(false);
                handleClose();
                setShow(true)
              }}
            >
              Register
            </button>
            <button
              style={{ background: "maroon" }}
              type="button"
              className="btn btn-danger mx-5"
              onClick={() => {
                setFile(null);
                setShowUpload(true)
              }}
            >
              Register Committee From File
            </button>
          </div>}
          <NotificationContainer />
        </>
      )}
    </>
  );
};

export default CommitteeMember;