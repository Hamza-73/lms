import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Modal } from 'react-bootstrap';
import { SetMealSharp } from '@mui/icons-material';
import {server} from '../server'

const EligibleGroup = (props) => {
  const [group, setGroup] = useState({ groups: [] });
  const [selectedGroupId, setSelectedGroupId] = useState('');


  const [viva, setViva] = useState({
    projectTitle: '', vivaDate: new Date(), vivaTime: '',
    external: "", chairperson: ""
  });
  const [isFieldsModified, setIsFieldsModified] = useState(false);
  const [isInvalidDate, setIsInvalidDate] = useState(false);

  const getProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await fetch(`${server}/committee/progress`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
      console.log('prograa is eligibele ', json)
      setGroup(json);
    } catch (error) {
      console.log(`Some error occurred: ${error.message}`);
    }
  }

  const scheduleViva = async (e) => {
    try {
      e.preventDefault();
      console.log('external ', viva.external)
      const response = await fetch(`${server}/viva/schedule-viva`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectTitle: viva.projectTitle,
          vivaDate: viva.vivaDate,
          vivaTime: viva.vivaTime,
          chairperson: viva.chairperson,
          external: viva.external
        }),
      });
      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        NotificationManager.success(json.message);
        setShow(false);
        getProjects()
      } else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error scheduling viva', error);
      NotificationManager.error(`Some error occurred try again/reload page`);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getDetail();
      getProjects();
      getCommittee();
      getExternal();
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
      }
    } catch (err) {
      console.log('error is in sidebar: ', err);
    }
  };

  const handleChange1 = (e) => {
    setViva({ ...viva, [e.target.name]: e.target.value });
  };

  // Function to get members
  const getCommittee = async () => {
    try {
      const response = await fetch(`${server}/supervisor/get-supervisors`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
      console.log('students are ', json); // Log the response data to see its structure
      setCommittee(json);
    } catch (error) {
    }
  }

  const [committee, setCommittee] = useState({ members: [] });
  const [external, setExternal] = useState({ members: [] });
  const getExternal = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await fetch(`${server}/external/get-externals`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
      console.log('supervisors are ', json); // Log the response data to see its structure
      setExternal(json);
    } catch (error) {
      console.log('error in fetching supervisor ', error);
    }
  }

  const [show, setShow] = useState(false);
  const [supervisor, setSupervisor] = useState("");

  const [documents, setDocuMents] = useState({
    doc: "", docLink: ""
  })
  
  const [ showDoc ,setShowDoc] = useState(false);

  return (
    <div>

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

      <div className="viva">
        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Header className="modal-header">
            <Modal.Title className="modal-title">Schedule Viva</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <form onSubmit={(e) => scheduleViva(e)}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Project Title
                </label>
                <input type="text" className="form-control" disabled={true} id="projectTitle" name="projectTitle" value={viva.projectTitle} onChange={handleChange1} />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Viva Date
                </label> <br />
                <input className='input-form' type='date' name='vivaDate' onChange={(e) => setViva({ ...viva, [e.target.name]: e.target.value })} value={viva.vivaDate} />
              </div>
              {isInvalidDate && (
                <div className="text-danger">Please enter a valid date (not in the past).</div>
              )}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Viva Time
                </label>
                <div>
                  <input className='input-form' type='time' name='vivaTime' onChange={(e) => setViva({ ...viva, [e.target.name]: e.target.value })} value={viva.vivaTime} />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Supervisor
                </label>
                <input type="text" className="form-control" disabled={true} name="supervisor" value={supervisor} />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Chair Person
                </label>
                <input type="text" className="form-control" name="chairperson" value={viva.chairperson} onChange={handleChange1} />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  External
                </label>
                <select className='form-select' name='external' onChange={(e) => setViva({ ...viva, [e.target.name]: e.target.value })} value={viva.external}>
                  <option value="">Select External Member</option>
                  {external.members && external.members.map((member, index) => (
                    <option key={index} value={member.username}>{member.name}</option>
                  ))}
                </select>
              </div>
              <Modal.Footer className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShow(false);
                }}>
                  Close
                </button>
                <button type="submit" className="btn btn-danger" style={{ background: 'maroon' }}
                  disabled={!viva.vivaTime || !viva.vivaDate || !viva.projectTitle || !viva.external || !viva.chairperson}
                >
                  Schedule
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>
      {group.groups.length > 0 ? (
        <>
          <h3 className='text-center my-4'>Groups Eligible For Viva</h3>
          <div className='container' style={{ width: "100%" }}>
            <table className='table table-hover'>
              <thead style={{ textAlign: "center" }}>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">My Group</th>
                  <th scope="col">Project Proposal</th>
                  <th scope="col">Documentation</th>
                  <th scope="col">Viva</th>
                </tr>
              </thead>
              <tbody style={{ textAlign: "center" }}>
                {group.groups
                  .filter((group) =>
                   ( (group.proposal || group.proposalLink) && (group.documentation || group.documentationLink) && !group.vivaDate)
                  )
                  .map((group, groupIndex) => (
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
                                  docLink: group.proposalLink, doc: group.proposal
                                })
                              }} style={{ color: "blue" }}>Submitted</p>
                            ) : 'Pending')}
                          </div>
                        </td><td>
                          <div style={{ cursor: "pointer" }} onClick={()=>{
                            setShowDoc(true);
                          }}>
                            {((group.documentation || group.documentationLink) ? (
                              <p onClick={() => {
                                setDocuMents({
                                  docLink: group.documentationLink, doc: group.documentation
                                })
                              }} style={{ color: "blue" }}>Submitted</p>
                            ) : 'Pending')}
                          </div>
                        </td>
                        <td>{
                          group.vivaDate ? <>
                            (group.isViva) ? 'Taken' : (<>{new Date(group.vivaDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} </>)
                          </> : (userData.member.isAdmin && <> <button className='btn btn-sm' style={{ background: "maroon", color: "white" }} onClick={() => {
                            setSelectedGroupId(group._id);
                            setViva({ projectTitle: project.projectTitle });
                            setShow(true);
                            setSupervisor(group.supervisor)
                          }} >Add Viva</button></>)
                        }</td>
                      </tr>
                    ))
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <h2 className='text-center'>No Groups have been enrolled for now.</h2>
      )}
      <NotificationContainer />
    </div>
  );
};

export default EligibleGroup;