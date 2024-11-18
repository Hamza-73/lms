import { current } from '@reduxjs/toolkit';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const Groups = (props) => {
  const [group, setGroup] = useState({ groups: [] });
  const [grades, setGrades] = useState({ marks: 0, external: 0, hod: 0 });
  const [groupId, setGrouppId] = useState('');

  const [addStudent, setAddStudent] = useState({
    rollNo: '', projectTitle: '',
  });


  const handleAddStudent = async (e) => {
    try {
      e.preventDefault();
      console.log('add stdents starts');
      const token = localStorage.getItem('token');
      console.log('add student is ', addStudent)
      const response = await fetch(`http://localhost:5000/supervisor/add-student/${addStudent.projectTitle}/${addStudent.rollNo}`, {
        method: 'POST',
        headers: {
          Authorization: token,
        },
      });

      const json = await response.json();
      console.log('response is ', json);

      if (json.success) {
        NotificationManager.success(json.message);
        setShowStudent(false);
      }
      else {
        NotificationManager.error(json.message);
      }
      handleClose();
    } catch (error) {
      console.log('error in adding student', error);
      NotificationManager.error('Some Error ocurred Try/Again');
    }
  };

  const handleMarks = async (e) => {
    try {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/supervisor/give-marks/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ marks: grades.marks, external: grades.external, hod: grades.hod })
      });

      const json = await response.json();
      console.log('response is ', json);

      if (json.success) {
        NotificationManager.success(json.message);
        getGroup()
        handleClose();
        setShow(false);
      }
      else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error in adding student', error);
    }
  };

  const getGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/supervisor/my-groups', {
        method: 'GET',
        headers: {
          'Content-Type': 'appication/json',
          authorization: `${token}`,
        },
      });
      const json = await response.json();
      console.log('json is ', json);
      setGroup(json);
    } catch (error) {
      console.log('error is ', error);
    }
  };

  useEffect(() => {
    getGroup();
    getRollNo();
  }, []);

  const handleChange1 = (e) => {
    setGrades({ ...grades, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setAddStudent({ ...addStudent, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setAddStudent({ rollNo: '', projectTitle: '', });
    setGrades({ external: 0, marks: 0 });
  }
  const [show, setShow] = useState(false);
  const [showStudent, setShowStudent] = useState(false);

  const [rollNo, setRollNo] = useState([])

  const getRollNo = async () => {
    try {
      const response = await fetch(`http://localhost:5000/student/rollNo`, {
        method: "GET",
      });
      const json = await response.json();
      console.log('roll No are ', json)
      setRollNo(json);
    } catch (error) {

    }
  }

  const changeName = async (e) => {
    e.preventDefault();
    if (titles.oldTitle.toLowerCase() === titles.title.toLowerCase()) {
      NotificationManager.error("Old Title and new Title cant be same");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/supervisor/changeName/${groupId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem("token")
        },
        body: JSON.stringify({
          oldtitle: titles.oldTitle,
          title: titles.title
        })
      });
      const json = await response.json();
      console.log('json in changing name is ', json);
      if (json.success) {
        NotificationManager.success(json.message);
        getGroup();
        setShowGroupName(false);
      } else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error in changing name ', error);
    }
  }

  const [showGroupName, setShowGroupName] = useState(false);
  const [titles, setTitles] = useState({
    oldTitle: "", title: ""
  });

  const handleTitleChange = (e) => {
    const { name, value } = e.target;
  
    const trimmedValue = value
        .replace(/[^A-Za-z ]/g, '')  // Remove characters other than A-Z, a-z, and space
        .replace(/\s+/g, ' ') 
  
    // Update the state
    setTitles((prevRegister) => ({
      ...prevRegister,
      [name]: trimmedValue,
    }));
  }  

  return (
    <div>
      <div className="changeName">
        <Modal show={showGroupName} onHide={() => {
          setShowGroupName(false);
        }}>
          <Modal.Header className="modal-header">
            <Modal.Title className="modal-title">Change Group Title</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <form onSubmit={(e) => { changeName(e) }}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Old Title</label>
                <input type="text" disabled={true} className="form-control" id="oldTitle" name="oldTitle" value={titles.oldTitle} />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">New Title</label>
                <input type="text" className="form-control" id="title" name="title" value={titles.title} onChange={handleTitleChange} />
              </div>
              <Modal.Footer className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => {
                  setTitles({
                    title: "", oldTitle: ""
                  }); setShowGroupName(false);
                }}>Close</button>
                <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} disabled={!titles.title || !titles.oldTitle}>
                  Change Name
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>
      <div className="fypIdea">
        <Modal show={show} onHide={() => {
          setShow(false);
        }}>
          <Modal.Header className="modal-header">
            <Modal.Title className="modal-title">Assign Grades</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <form onSubmit={(e) => { handleMarks(e) }}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Internal's Supervisor</label>
                <input type="number" className="form-control" id="marks" min='0' max='100' name="marks" value={grades.marks} onChange={handleChange1} />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Chair Person</label>
                <input type="number" className="form-control" id="marks" min='0' max='100' name="hod" value={grades.hod} onChange={handleChange1} />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">External</label>
                <input type="number" className="form-control" id="marks" min='0' max='100' name="external" value={grades.external} onChange={handleChange1} />
              </div>
              <Modal.Footer className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => {
                  handleClose(); setShow(false);
                }}>Close</button>
                <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} disabled={!grades.marks || !grades.external || !grades.hod}>
                  Give Grades
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>

      <div className="fypIdea">
        <Modal show={showStudent} onHide={() => {
          setShowStudent(false);
        }}>
          <Modal.Header>
            <Modal.Title>Add Student To Existing Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleAddStudent}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Project Title</label>
                <input type="text" disabled={true} className="form-control" id="projectTitle" name="projectTitle" value={addStudent.projectTitle} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="rollNo" className="form-label">Student Roll No</label>
                <select name="rollNo" id="" className='form-select' value={addStudent.rollNo} onChange={handleChange} >
                  <option value="">Select Student</option>
                  {
                    rollNo && rollNo.map((student, studentKey) => {
                      return (<option key={studentKey} value={student}>{student}</option>)
                    })
                  }
                </select>
              </div>
              <Modal.Footer className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => {
                  handleClose(); setShowStudent(false);
                }}>Close</button>
                <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} >
                  Add Student
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>

      {current.length > 0 ? (
        <>
          <h3 className='text-center my-4'>Students Under Me</h3>
          <div className='container' style={{ width: "100%" }}>
            <div>
              <div>
                <table className='table table-hover'>
                  <thead style={{ textAlign: "center" }}>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">My Group</th>
                      <th scope="col">Meeting</th>
                      <th scope="col">Project Proposal</th>
                      <th scope="col">Documentation</th>
                      <th scope="col">Add Student</th>
                      <th scope="col">Viva</th>
                      <th scope="col">Grade</th>
                      <th scope="col">Change Name</th>
                    </tr>
                  </thead>
                  {group.groups.map((group, groupIndex) => (
                    <tbody key={groupIndex} style={{ textAlign: "center" }}>
                      {group.projects.map((project, projectKey) => (
                        <tr key={projectKey}>
                          <td>
                            <div>
                              {project.students.map((student, studentKey) => (
                                <React.Fragment key={studentKey}>
                                  {student.name}<br />
                                </React.Fragment>
                              ))}
                            </div>
                          </td>
                          <td>{project.projectTitle}</td>
                          <td>{group.meeting}</td>
                          <td>{(group.proposal || group.proposalLink) ? 'Submitted' : 'Pending'}</td>
                          <td>{(group.documentation || group.documentationLink) ? 'Submitted' : 'Pending'}</td>
                          <td><button disabled={project.students.length === 2} onClick={() => { setAddStudent({ projectTitle: project.projectTitle }); setShowStudent(true); }} className="btn btn-sm" style={{ background: "maroon", color: "white" }}>Add Student</button></td>
                          <td>
                            {
                              group.vivaDate ?
                                (
                                  !group.isViva ?
                                    new Date(group.vivaDate).toISOString().split('T')[0] : "Taken"
                                ) :
                                "Pending"
                            }
                          </td>

                          <td>
                            <div style={{ cursor: "pointer" }}>
                              {(group.marks && group.externalMarks && group.hodMarks) ? (group.marks + group.externalMarks + group.hodMarks) / 3 : 0} &nbsp;&nbsp; <i className="fa-solid fa-pen-to-square" onClick={() => {
                                setGrouppId(group._id); setGrades({
                                  external: group.externalMarks, hod: group.hodMarks, marks: group.marks
                                });
                                setShow(true);
                              }}></i>
                            </div>
                          </td>
                          <td>
                            <button style={{
                              color: "white", background: "maroon"
                            }} className="btn btn-sm" onClick={() => {
                              setGrouppId(group._id);
                              setShowGroupName(true);
                              setTitles({
                                oldTitle: group.projects[0].projectTitle
                              });
                            }}
                            disabled={
                              group.proposal
                            }>Edit Title</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <h2 className='text-center' style={{ position: "absolute", transform: "translate(-50%,-50%", left: "50%", top: "50%" }}>You currently have no group in supervision.</h2>
      )}
      <NotificationContainer />
    </div>
  );
};

export default Groups;