import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Modal } from 'react-bootstrap';
import {server} from '../server'

const AdminList = (props) => {
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
    fname: "", lname: "", username: "", email: "", password: ""
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Check if any required field is empty
      if (!register.fname.trim() || !register.lname.trim() || !register.username.trim() || !register.email.trim() || !register.password.trim()) {
        NotificationManager.error('Please fill in all required fields.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(register.email)) {
        NotificationManager.warning("Invalid Email Address");
        return;
      }
      const response = await fetch(`${server}/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fname: register.fname.trim(), lname: register.lname.trim(), username: register.username.trim(),
          password: register.password, email: register.email.trim()
        })
      });
      const json = await response.json();
      console.log(json);
      if (json.success) {
        NotificationManager.success('Registration Successful');
        getMembers();
        // Clear the register form fields
        setRegister({
          fname: "", lname: "", username: "", email: "", password: ""
        });
        setShow(false);
      }
      else {
        console.log('error is ', json)
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
      if (!register.fname.trim() || !register.lname.trim() || !register.username.trim() || !register.email.trim()) {
        NotificationManager.error('Please fill in all required fields.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(register.email)) {
        NotificationManager.warning("Invalid Email Address");
        return;
      }

      const id = selectedStudent._id;
      const response = await fetch(`${server}/admin/edit/${id}`,
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token')
          },
          body: JSON.stringify({
            fname: register.fname, lname: register.lname, username: register.username,
            email: register.email
          })
        }
      );

      const updatedStudent = await response.json();
      if (updatedStudent) {
        getMembers();
        setEditMode(false); // Disable edit mode after successful edit
        setRegister({
          fname: '', lname: '', username: '', email: '', password: ''
        });
        setShow(false);
      }
      if (updatedStudent.success)
        NotificationManager.success('Edited Successfully');
      else
        NotificationManager.error(updatedStudent.message);


    } catch (error) {
      console.log('Error:', error); // Log the error message
    }
  };


  // Function to open edit modal
  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditMode(true);
    setRegister({
      fname: student.fname, lname: student.lname, username: student.username, email: student.email,
    });
  };



  // Function to handle delete
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete?');
    if (confirmed) {
      try {
        console.log('id is ', id)
        const response = await axios.delete(`${server}/admin/delete/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              "Authorization": localStorage.getItem('token')
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
      const response = await axios.get(`${server}/admin/get-members`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.data;
      console.log('students are ', json); // Log the response data to see its structure
      setData(json);
    } catch (error) {

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

      const response = await fetch(`${server}/admin/detail`, {
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
    const fetchData = async () => {
      try {
        if (!localStorage.getItem('token')) {
          history('/');
        } else {
          setLoading(true);
          await getDetail();
          await getMembers();
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Note: empty dependency array to run the effect only once


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
    setRegister({ fname: "", lname: "", username: "", email: "", password: "" });
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

    // Check if any word in the search query matches either first name, last name, or name
    const matchesFirstName = member.fname && searchWords.some((word) =>
      member.fname.toLowerCase().includes(word)
    );
    const matchesLastName = member.lname && searchWords.some((word) =>
      member.lname.toLowerCase().includes(word)
    );
    const matchesName = member.name && searchWords.some((word) =>
      member.name.toLowerCase().includes(word)
    );

    return (
      matchesFirstName ||
      matchesLastName ||
      matchesName
    );
  });

  const filteredDataPaginated = paginate(filteredData, recordsPerPage, currentPage);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / recordsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const location = useLocation();
  const pathsWithoutSidebar = ['/', '/committeeMain', '/committeeMain/members'];

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
      setShowUpload(false);
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
            <Modal.Title>Export Data From File</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={(e) => handleSubmit(e, 'Admin')}>
              <div className="mb-3">
                <label htmlFor="remrks" className="form-label">File</label>
                <small>Type should be : .xls/.xlsx <br /> Excel file should contain fname, lname ,username and email.- Data must be unique</small> <br />
                <input type="file" onChange={handleFileChange} accept=".xls, .xlsx" />
              </div>
              <Modal.Footer>
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => { setFile(null); setShowUpload(false); }}>Close</button>
                <button type="submit" className="btn btn-success" disabled={!file}> Upload </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>
      {/* REGISTER */}
      <div className="register">
        <style>{style}</style>
        <Modal show={show} onHide={() => { setEditMode(false); setShow(false) }}>
          <Modal.Header>
            <Modal.Title>{!editMode ? "Register" : "Edit"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={editMode ? handleEdit : handleRegister}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">First Name</label>
                <input type="text" className="form-control" required={true} minLength={3} id="name" name='fname' value={register.fname} onChange={handleChange1} />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Last Name</label>
                <input type="text" className="form-control" required={true} minLength={3} id="name" name='lname' value={register.lname} onChange={handleChange1} />
                {firstNameLastNameEqual && (
                  <div className="alert alert-danger" role="alert">
                    First name and last name should not be equal.
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputusername1" className="form-label">Username</label>
                <input type="text" className="form-control" required={true} minLength={3} id="exampleInputusername2" name='username' value={register.username} onChange={handleChange1} />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label"> Email </label>
                <input type="email" className="form-control" required={true} id="email" name="email" value={register.email} onChange={handleChange1} />
              </div>
              {!editMode ? <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                <input type="password" className="form-control" required={true} minLength={6} id="exampleInputPassword2" name='password' value={register.password} onChange={handleChange1} />
                <small>password should be of at least 6 characters </small>
              </div> : ''}
              <Modal.Footer className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => {
                  handleClose(); setShow(false);
                }}>Close</button>
                {editMode ? (
                  <button type="submit" className="btn" disabled={!(register.fname) || !(register.lname)
                    || !(register.username) || !(register.email) || firstNameLastNameEqual} style={{ background: "maroon", color: "white" }}>Save Changes</button>
                ) : (
                  <button type="submit" className="btn btn-success" disabled={!(register.fname) || !(register.lname)
                    || !(register.username) || !(register.email) || firstNameLastNameEqual}>
                    Register
                  </button>
                )}
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>

      {loading ? (<Loading />) : (<>
        <div className='container' style={{ width: "90%" }}>
          <h3 className='text-center'>Admins</h3>
          <div className="mb-3">
            <label htmlFor="recordsPerPage" className="form-label">Records per page:</label>
            <select id="recordsPerPage" className="form-select" value={recordsPerPage} onChange={(e) => {
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
            <table className="table table-hover text-center">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Username</th>
                  <th scope="col">Email</th>
                  <th scope="col">Edit</th>
                  {(!showSidebar && !userData.member.isAdmin) && (
                    <th scope="col">Remove</th>
                  )}
                </tr>
              </thead>
              <tbody className='text-center'>
                {filteredDataPaginated.map((val, key) => (
                  <tr key={key}>
                    <td>
                      <td>
                        {!val.isAdmin ? (
                          <>
                            {val.fname + ' ' + val.lname}{val.superAdmin && <small>(super admin)</small>}
                          </>
                        ) : (
                          <>
                            {!val.isCommittee ? (
                              <>
                                {val.fname + ' ' + val.lname} <small>(committee)</small>
                              </>
                            ) : (
                              <>
                                {val.name} <small>(sup)</small>
                              </>
                            )}
                          </>
                        )}
                      </td>

                    </td>
                    <td>{val.username}</td>
                    <td>{val.email}</td>
                    <td style={{ cursor: "pointer" }}>
                      <button onClick={() => { openEditModal(val); setShow(true); }}
                        disabled={val.isAdmin || val.isCommittee || (!userData.member.superAdmin && val.superAdmin)} className="btn" style={{ background: "maroon", color: "white" }}>
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    </td>
                    {(!showSidebar && !userData.member.isAdmin) && <td style={{ cursor: "pointer", color: "maroon", textAlign: "center", fontSize: "25px" }}>
                      <button onClick={() => handleDelete(val._id)} className="btn" style={{ background: "maroon", color: "white" }}
                        disabled={(!userData.member.superAdmin && val.superAdmin)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No matching members found.</div>
          )}
          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-success"
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-success"
              disabled={currentPage === Math.ceil(filteredData.length / recordsPerPage)}
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>

        </div>
        {(!showSidebar && !userData.member.isAdmin) && (
          <div className="d-grid gap-2 col-6 mx-auto my-4">
            <button style={{ background: "maroon" }} type="button" className="btn btn-danger mx-5" onClick={() => { setEditMode(false); handleClose(); setShow(true); }}>
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
              Register Admin From File
            </button>
          </div>
        )}
        <NotificationContainer />
      </>)}
    </>
  );
}

export default AdminList;