import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Calendar from 'react-calendar';
import TimePicker from 'react-time-picker';
import Loading from '../Loading';
import { Modal } from 'react-bootstrap';

const ProjectProgress = (props) => {
  const [group, setGroup] = useState({ groups: [] });
  const [deadline, setdeadline] = useState({ dueDate: '', type: '', instructions: '' });

  const [loading, setLoading] = useState(false);


  const getProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await fetch("http://localhost:5000/committee/progress", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
      console.log('prograa is ', json)
      setGroup(json);
    } catch (error) {
      console.log(`Some error occurred: ${error.message}`);
    }
  }

  const handleDate = async (e) => {
    try {
      e.preventDefault();
      console.log('duedate starts');
      const response = await fetch(`http://localhost:5000/committee/dueDate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token")
        },
        body: JSON.stringify({ dueDate: deadline.date, type: deadline.type, instructions: deadline.instructions })
      });
      const json = await response.json();
      if (json)
        alert(json.message);
      // to show dealine history immediately after due date
      getDetail()
      setShow(false);
    } catch (error) {
      console.log(`Some error occurred: ${error}`);
    }
  }

  const typeOptions = ['proposal', 'documentation']

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      getDetail();
      getProjects();
      setLoading(false);
    }, 1000)

  }, []);

  const [userData, setUserData] = useState({ member: [] });

  const getDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('token not found');
        return;
      }

      const response = await fetch(`http://localhost:5000/committee/detail`, {
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
      }
    } catch (err) {
      console.log('error is in sidebar: ', err);
    }
  };

  const handleChange = (e) => {
    setdeadline({ ...deadline, [e.target.name]: e.target.value });
  }

  const myStyle = `
  .meeting-box {
    background-color: #ffffff;
    border: 1px solid #d1d1d1;
    border-radius: 6px;
    width: 200px;
    padding: 10px;
    margin: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .items {
    display: flex;
    justify-content: space-between;
  }
  .meeting-box a {
    text-decoration: none;
    color: #007bff;
  }
  `

  const [showDeadlineHistory, setShowDeadlineHistory] = useState(false);
  const toggleDeadlineHistory = () => {
    setShowDeadlineHistory(!showDeadlineHistory);
  };

  const [show, setShow] = useState(false);
  const [documents, setDocuMents] = useState({
    doc: "", docLink: ""
  });

  const [ showDoc ,setShowDoc] = useState(false);

  return (
    <div>
      <div>
        <div className="Deadline"  >
          <Modal show={show} onHide={() => {
            setShow(false);
          }}>
            <Modal.Header className="modal-header">
              <Modal.Title className="modal-title" >Upload Deadline</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body">
              <form onSubmit={(e) => handleDate(e)}>
                <div className="mb-3">
                  <label htmlFor="remrks" className="form-label">Type</label>
                  <select className="form-control" id="type" name='type' value={deadline.type} onChange={handleChange}>
                    <option value="">Select Type</option>
                    {typeOptions.map((option, index) => (
                      <option key={index} value={option}>{option[0].toUpperCase() + option.slice(1, option.length)}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="remrks" className="form-label">date</label>
                  <input type='date' className="form-control" id="date" name='date' value={deadline.date} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="remrks" className="form-label">Instructions</label>
                  <textarea type='text' className="form-control" id="instructions" name='instructions' value={deadline.instructions} onChange={handleChange} />
                </div>
                <Modal.Footer className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={(e) => { setdeadline({ type: "", dueDate: "", instructions: "" }); setShow(false); }}>Close</button>
                  <button type="submit" className="btn btn-success" disabled={!deadline.type || !deadline.date}> Add deadline </button>
                </Modal.Footer>
              </form>
            </Modal.Body>
          </Modal>
        </div>
      </div>

      <Modal show={showDoc} onHide={()=>{
        setShowDoc(false);
      }}>
        <Modal.Header className="modal-header">
          <Modal.Title className="modal-title fs-5" id="exampleModalLabel">Document</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <>
            <form>
              {documents.doc && <> <label htmlFor="">Document</label> <br />
                <a target="_blank" href={documents.doc ? documents.doc : ""}>See Document</a> </>} <br />
              {documents.docLink && <> <label htmlFor="">Document Link</label> <br />
                <a target="_blank" href={documents.docLink ? documents.docLink : ""}>See Document</a> </>}
              <br />
              <Modal.Footer className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>{
                  setShowDoc(false);
                }}> Close</button>
              </Modal.Footer>
            </form>
          </>
        </Modal.Body>
      </Modal>

      {loading ? <Loading /> : <>
        {group.groups.length > 0 ? (
          <>
            {(userData.member.propDate || userData.member.docDate) && <button
              className="btn btn-secondary"
              style={{ position: "absolute", top: "82px", right: "15rem", background: "maroon", color: "white" }}
              onClick={toggleDeadlineHistory}
            >
              {showDeadlineHistory ? "Hide Deadline History" : "Show Deadline History"}
            </button>}
            {showDeadlineHistory &&
              <>{
                (userData.member.propDate || userData.member.docDate) && <div>
                  <style>{myStyle}</style>
                  <div>
                    <div>
                      <div className="meeting-box" style={{
                        width: "200px", position: "absolute", right: "10px", top
                          : "3.7rem"
                      }}>
                        <div className="container">
                          <p>Deadlines History</p>
                          {userData.member.propDate && <div className='items' style={{ fontSize: "12px" }}>
                            <p>Proposal :</p>
                            <p>{new Date(userData.member.propDate).toISOString().split('T')[0]}</p>
                          </div>}
                          {userData.member.docDate && <div className='items' style={{ fontSize: "12px" }}>
                            <p>Documentation :</p>
                            <p>{new Date(userData.member.docDate).toISOString().split('T')[0]}</p>
                          </div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }</>}

            <h3 className='text-center my-4'>Pending Project</h3>
            <div className='container' style={{ width: "100%" }}>
              <table className='table table-hover'>
                <thead style={{ textAlign: "center" }}>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">My Group</th>
                    <th scope="col">Project Proposal</th>
                    <th scope="col">Documentation</th>
                  </tr>
                </thead>
                <tbody style={{ textAlign: "center" }}>
                  {group.groups
                    .filter((group) =>
                      ((!group.proposal && !group.proposalLink) || (!group.documentation && !group.documentationLink))

                    ).map((group, groupIndex) => (
                      group.projects.map((project, projectKey) => (
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
                          <td>
                            <div style={{ cursor: "pointer" }} onClick={()=>{
                              setShowDoc(true);
                            }}>
                              {((group.proposal || group.proposalLink) ? (
                                <p onClick={() => {
                                  setDocuMents({
                                    doc: group.proposal, docLink: group.proposalLink
                                  })
                                }} style={{ color: "blue" }}>Uploaded</p>
                              ) : 'Pending')}
                            </div>
                          </td><td>
                            <div style={{ cursor: "pointer" }} onClick={()=>{
                              setShowDoc(true);
                            }}>
                              {((group.documentation || group.documentationLink) ? (
                                <p onClick={() => {
                                  setDocuMents({
                                    doc: group.documentation, docLink: group.documentationLink
                                  })
                                }} style={{ color: "blue" }}>Uploaded</p>
                              ) : 'Pending')}
                            </div>
                          </td>
                        </tr>
                      ))
                    ))}
                </tbody>
              </table>
            </div>
            {userData.member.isAdmin && <div>
              <div className='d-grid gap-2 d-md-flex justify-content-md-end buttonCls' style={{ position: "relative", marginTop: "4%", right: "9%" }}>
                <button className="btn" style={{ background: "maroon", color: "white" }} onClick={() => {
                  setShow(true);
                }} >Add Date</button>
              </div>
            </div>}
          </>
        ) : (
          <h2 className='text-center'>No Groups have been enrolled for now.</h2>
        )}
      </>}
      <NotificationContainer />
    </div>
  );
};

export default ProjectProgress;