import React, { useEffect, useRef, useState } from 'react';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import {server} from '../server'

const ProjectIdeas = () => {
  const [fypIdea, setFypIdea] = useState({
    projectTitle: '', description: '', scope: '', active: true
  });
  const [idea, setIdea] = useState({
    supervisor: "", ideas: [{
      projectTitle: '', description: '', scope: '',
      time: '', date: '',
    }]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setTimeout(() => {
        getIdeas();
        getRollNo();
      }, 1000);
      console.log('inside effect ', idea)
    }
  }, []);

  const getIdeas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${server}/supervisor/myIdeas`, {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      });
      const json = await response.json();
      console.log('idea json is ', json);
      setIdea(json)
      setLoading(false)
    } catch (error) {
      console.log('error in ideas', error);
    }
  }

  const [addStudent, setAddStudent] = useState({ rollNo: '', projectTitle: '', });
  const [isAddStudentButtonEnabled, setIsAddStudentButtonEnabled] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [projectId, setProjectId] = useState('');


  const handleIdea = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${server}/supervisor/send-project-idea`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        }, body: JSON.stringify({
          projectTitle: fypIdea.projectTitle.toLowerCase().trim(), description: fypIdea.description,
          scope: fypIdea.scope, active: fypIdea.active
        })
      });
      const json = await response.json();

      if (!json.success) {
        NotificationManager.error(json.message);
        console.log('json message is ', json)
        return;
      }

      if (json) {
        NotificationManager.success(json.message);
        // Update the state with the new idea
        getIdeas()
        setFypIdea({ projectTitle: "", scope: "", description: "" });
      }
      console.log('json in adding idea is ', json)
    } catch (error) {
      console.log('error adding project request', error);
    }
  }


  const handleAddStudent = async (e, projectTitle, rollNo) => {
    try {
      e.preventDefault();
      console.log('adding students starts');
      const token = localStorage.getItem('token');
      const response = await fetch(`${server}/supervisor/add-student/${projectTitle}/${rollNo}`, {
        method: 'POST',
        headers: {
          Authorization: token,
        },
      });

      const json = await response.json();
      console.log('response is ', json);

      if (json.success) {
        NotificationManager.success(json.message);
      }
      else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error in adding student', error);
      NotificationManager.error('Some Error occurred. Try Again');
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this FYP Idea?');

      if (confirmDelete) {
        console.log('handle delete starts');
        console.log('project id is ', id);

        const token = localStorage.getItem('token');
        const response = await fetch(`${server}/supervisor/deleteProposal/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: token,
          },
        });

        const json = await response.json();
        console.log('response is in deleting ', json);

        if (json.success) {
          NotificationManager.success(json.message);

          // Update the state to remove the deleted idea
          setIdea((prevState) => ({
            ...prevState,
            ideas: prevState.ideas.filter((ideaItem) => ideaItem.projectId !== id),
          }));
        } else {
          NotificationManager.error(json.message);
        }
      } else {
        return;
      }
    } catch (error) {
      console.log('error in deleting idea', error);
    }
  };


  const handleEdit = async (e) => {
    try {
      e.preventDefault();
      console.log('fypIdea is ', fypIdea.active)
      const token = localStorage.getItem('token');
      const response = await axios.put(`${server}/supervisor/editProposal/${projectId}`, {
        projectTitle: fypIdea.projectTitle, description: fypIdea.description,
        scope: fypIdea.scope, active: fypIdea.active
      }, {
        headers: {
          Authorization: token,
        },
      });

      const json = await response.data;
      console.log('response is in editing ', json);
      if (json.success) {
        NotificationManager.success("Edit Succesful");
        setEditMode(false);
        hanldeClose();
        setShow(false);
        getIdeas()
      }
      else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('Error editing idea', error);
      NotificationManager.error('Some Error occurred. Try Again');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleIdea();
    setShow(false);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    let trimmedValue = value.replace(/\s+/g, ' '); // Remove consecutive spaces and non-alphabetic characters
    trimmedValue = trimmedValue.replace(/[^a-zA-Z\s]/g, '')
    setFypIdea((prevRegister) => ({
      ...prevRegister,
      [name]: trimmedValue,
    }));
  };

  const handleChange1 = (e) => {
    setAddStudent({ ...addStudent, [e.target.name]: e.target.value })
  }

  // Add a useEffect hook to watch for changes in the addStudent state
  useEffect(() => {
    // Check if both projectTitle and rollNo are not empty to enable the button
    setIsAddStudentButtonEnabled(!!addStudent.projectTitle && !!addStudent.rollNo);
  }, [addStudent.projectTitle, addStudent.rollNo]);

  const hanldeClose = () => {
    setFypIdea({
      projectTitle: "", scope: "", description: ""
    })
  }

  const [expandedGroups, setExpandedGroups] = useState([]);
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

  const [show, setShow] = useState(false);
  const [showStudent, setShowStudent] = useState(false);

  const [rollNo, setRollNo] = useState([])

  const getRollNo = async () => {
    try {
      const response = await fetch(`${server}/student/rollNo`, {
        method: "GET",
      });
      const json = await response.json();
      console.log('roll No are ', json)
      setRollNo(json);
    } catch (error) {

    }
  }

  return (
    <div>
      <div className="fypIdea"  >
        <Modal show={show} onHide={() => {
          setShow(false);
          setFypIdea({
            projectTitle: "", scope: "", description: ""
          })
        }}>
          <Modal.Header>
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={editMode ? handleEdit : handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Project Title</label>
                <input type="text" className="form-control" id="projectTitle" name='projectTitle' value={fypIdea.projectTitle} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Scope</label>
                <input type="text" className="form-control" id="scope" name='scope' value={fypIdea.scope} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Description</label>
                <textarea className="form-control" id="description" name='description' value={fypIdea.description} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="isActive" className="form-label">Status</label>
                <select className="form-select" id="active" name="active" value={fypIdea.active} onChange={handleChange}>
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
              <Modal.Footer>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setEditMode(false);
                  hanldeClose();
                  setShow(false);
                }}>Close</button>
                <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} disabled={!fypIdea.projectTitle || !fypIdea.scope || !fypIdea.description}>
                  {editMode ? "Edit" : "Add Idea"}
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>

      <div className="addstudenyt">
        <Modal show={showStudent} onHide={() => {
          setShowStudent(false);
          setAddStudent({
            projectTitle:"", rollNo:""
          })
        }}>
          <Modal.Header>
            <Modal.Title>Add Student To Existing Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={(e) => { handleAddStudent(e, addStudent.projectTitle, addStudent.rollNo); }}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Project Title</label>
                <input type="text" className="form-control" required={true} disabled={true} id="projectTitle" name="projectTitle" value={addStudent.projectTitle} onChange={handleChange1} />
              </div>
              <div className="mb-3">
                <label htmlFor="rollNo" className="form-label">Student Roll No</label>
                <select name="rollNo" id="" className='form-select' required={true} value={addStudent.rollNo} onChange={handleChange1}>
                  <option value="">Select Student By Roll No</option>
                  {
                    rollNo && rollNo.map((student, studentKey) => {
                      return (<option key={studentKey} value={student}>{student}</option>)
                    })
                  }
                </select>
              </div>
              <Modal.Footer className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => {
                  setAddStudent({
                    projectTitle: "", rollNo: ""
                  });
                  setShowStudent(false);
                }}>Close</button>
                <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} disabled={!addStudent.projectTitle || !addStudent.rollNo}>
                  Add Student
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>

      {!loading ? (
        <>
          {idea.ideas.length > 0 ? (
            <div className="container my-5" style={{ width: "100%" }}>
              <h3 className='text-center'>My FYP Ideas</h3>
              <div>
                <div>
                  <table className='table table-hover text-center'>
                    <thead style={{ textAlign: "center" }}>
                      <tr>
                        <th scope="col">Sr No.</th>
                        <th scope="col">Supervisor</th>
                        <th scope="col">Project Title</th>
                        <th scope="col">Scope</th>
                        <th scope="col">Description</th>
                        <th scope="col">Time</th>
                        <th scope="col">Date</th>
                        <th scope="col">Add Student</th>
                        <th scope="col">Edit</th>
                        <th scope="col">Delete</th>
                      </tr>
                    </thead>
                    <tbody className='text-center'>
                      {idea.ideas.map((group, groupKey) => (
                        <tr key={groupKey}>
                          <td>{groupKey + 1}</td>
                          <td>{idea.supervisor}</td>
                          <td>{group.projectTitle}</td>
                          <td>
                            <div
                              onClick={() => toggleExpand(groupKey)}
                              style={{ cursor: 'pointer' }}
                            >
                              {expandedGroups[groupKey]
                                ? group.scope
                                : (
                                  <>
                                    {truncateText(group.scope, 3)}
                                  </>
                                )}
                            </div>
                          </td>
                          <td>
                            <div
                              onClick={() => toggleExpand(groupKey)}
                              style={{ cursor: 'pointer' }}
                            >
                              {expandedGroups[groupKey]
                                ? group.description
                                : (
                                  <>
                                    {truncateText(group.description, 3)}
                                  </>
                                )}
                            </div>
                          </td>
                          <td>{group.time}</td>
                          <td>{group.date ? group.date.split('T')[0] : ""}</td>
                          <td>
                            <button className="btn btn-sm" data-toggle="modal" data-target="#exampleModal1" style={{ background: "maroon", color: "white" }} type="button"
                              onClick={() => {
                                setAddStudent({ projectTitle: group.projectTitle });
                                setFypIdea({
                                  projectTitle: group.projectTitle,
                                  description: group.description,
                                  scope: group.scope,
                                  active: group.active // Set active property from the group to fypIdea
                                });
                                setShowStudent(true);
                              }} disabled={!group.active}>
                              Add Student
                            </button>
                          </td>
                          <td>
                            <button style={{ background: "maroon", color: "white" }}
                              className="btn"
                              onClick={() => {
                                setEditMode(true);
                                setProjectId(group.projectId);
                                setFypIdea({
                                  projectTitle: group.projectTitle,
                                  description: group.description,
                                  scope: group.scope,
                                  active: group.active // Set active property from the group to fypIdea
                                });
                                setShow(true);
                              }} // Disable the button if group or fypIdea is not active
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                          </td>

                          <td onClick={() => {
                            handleDelete(group.projectId);
                          }}>
                            <button className="btn" style={{ background: "maroon", color: "white" }}>
                              <i class="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <h2 className='text-center' style={{ position: "absolute", transform: "translate(-50%,-50%", left: "50%", top: "50%" }}>No Project Ideas! Add to see your ideas.</h2>
          )}

          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn" onClick={() => {
              setShow(true);
            }} style={{ background: "maroon", color: "white", position: "relative", right: "7rem" }} type="button">
              Add FYP Idea
            </button>
          </div>
          <NotificationContainer />
        </>
      ) : <Loading />}
    </div>
  )
}

export default ProjectIdeas;