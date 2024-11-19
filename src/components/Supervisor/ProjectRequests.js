import React, { useEffect, useState } from 'react';
import Loading from '../Loading';
import SideBar from '../SideBar';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Modal } from 'react-bootstrap';
import {server} from '../server'

const ProjectRequests = (props) => {
  const [requests, setRequests] = useState({ request: [] });
  const [improve, setImprove] = useState({ projectTitle: '', scope: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState("");

  useEffect(() => {
    const getRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${server}/supervisor/view-sent-proposals`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        });
        const json = await response.json();
        console.log('ia am side bar');
        console.log('json requests is ', json);

        if (json) {
          setRequests(json);
        }
        setLoading(false);
      } catch (error) {
        console.log('error fetching requests', error);
      }
    };
    if (localStorage.getItem('token')) {
      setTimeout(() => {
        // setLoading(true);
        getRequests();
      }, 1000);
    }
  }, []);

  const handleRequests = async (e) => {
    try {
      e.preventDefault();
      console.log('request is started');
      const token = localStorage.getItem('token');
      const response = await fetch(`${server}/supervisor/improve-request/${requestId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token,
        },
        body: JSON.stringify({
          projectTitle: improve.projectTitle, scope: improve.scope, description: improve.description
        })
      });
      console.log('after fetch')

      console.log('Response status:', response.status);
      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        setRequests(prevState => ({
          request: prevState.request.filter(req => req.requestId !== requestId)
        }));
        setImprove({ projectTitle: "", scope: "", description: "" });
        NotificationManager.success(json.message, '', 1000);
        setShow(false);
      } else {
        NotificationManager.error(json.message, '', 1000);;
      }
    } catch (error) {
      console.log('error dealing with requests', error);
    }
  };

  const rejectRequest = async (id) => {
    try {

      console.log('request is started');
      console.log('improve', improve)
      const token = localStorage.getItem('token');
      const response = await fetch(`${server}/supervisor/reject-request/${id}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token,
        },
      });
      console.log('after fetch')

      console.log('Response status:', response.status);
      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        setRequests(prevState => ({
          request: prevState.request.filter(req => req.requestId !== id)
        }));
        NotificationManager.success(json.message, '', 1000);
      } else {
        NotificationManager.error(json.message, '', 1000);;
      }
    } catch (error) {
      console.log('error dealing with requests', error);
    }
  };

  const acceptRequest = async (id) => {
    try {
      console.log('request is started');
      const token = localStorage.getItem('token');
      const response = await fetch(`${server}/supervisor/accept-request/${id}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token,
        },
      });
      console.log('after fetch')

      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        setRequests(prevState => ({
          request: prevState.request.filter(req => req.requestId !== id)
        }));
        NotificationManager.success(json.message, '', 1000);
      } else {
        NotificationManager.error(json.message, '', 1000);;
      }
    } catch (error) {
      console.log('error dealing with requests', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ensure name is alphabetic and only allows one space
    const trimmedValue = value
      .replace(/[^A-Za-z ]/g, '') // Remove characters other than A-Z, a-z, and space
      .replace(/\s+/g, ' ');                  // Trim leading and trailing spaces

    setImprove((prevRegister) => ({
      ...prevRegister,
      [name]: trimmedValue,
    }));
  };

  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="imporve">
        <Modal show={show} onHide={() => {
          setShow(false);
        }}>
          <Modal.Header>
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleRequests}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Project Title</label>
                <input type="text" className="form-control" id="projectTitle" name="projectTitle" value={improve.projectTitle} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Scope</label>
                <input type="text" className="form-control" id="scope" name="scope" value={improve.scope} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Description</label>
                <textarea className="form-control" id="description" name="description" value={improve.description} onChange={handleChange} />
              </div>
              <Modal.Footer >
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShow(false);
                }}>Close</button>
                <button type="submit" className="btn" style={{ background: 'maroon', color: 'white' }} disabled={!improve.projectTitle || !improve.scope || !improve.description}>
                  Improve Request
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>

      {!loading ? (
        <>
          {requests.request.length > 0 ? (
            <div div className="container" style={{ width: '100%' }}>
              <h3 className="text-center">Requests</h3>
              <div>
                <div>
                  <table className="table table-hover">
                    <thead style={{ textAlign: 'center' }}>
                      <tr>
                        <th scope="col">Student Name</th>
                        <th scope="col">Roll No</th>
                        <th scope="col">Project Title</th>
                        <th scope="col">Description</th>
                        <th scope="col">Scope</th>
                        <th scope="col">Accept/Reject/Improve</th>
                      </tr>
                    </thead>
                    {requests.request.map((group, groupKey) => (
                      <tbody key={groupKey} style={{ textAlign: 'center' }}>
                        {group.studentDetails.map((project, projectKey) => (
                          <tr key={projectKey}>
                            <td>
                              <div>
                                <React.Fragment key={projectKey}>
                                  {project.studentName}<br />
                                </React.Fragment>
                              </div>
                            </td>
                            <td>
                              <div>
                                <React.Fragment key={projectKey}>
                                  {project.rollNo}<br />
                                </React.Fragment>
                              </div>
                            </td>
                            <td>{group.projectTitle}</td>
                            <td>{group.description}</td>
                            <td>{group.scope}</td>
                            <td>
                              <div style={{ cursor: 'pointer' }}>
                                <div className="d-grid gap-2 d-md-flex">
                                  <button className="btn btn-success btn-sm me-md-2" type="button" onClick={() => {
                                    acceptRequest(group.requestId);
                                  }}>Accept</button>
                                  <button className="btn btn-warning btn-sm" type="button" onClick={(e) => {
                                    rejectRequest(group.requestId);
                                  }}>Reject</button>
                                  <button className="btn btn-sm" style={{ background: 'maroon', color: 'white' }} type="button" onClick={() => {
                                    setRequestId(group.requestId); setImprove({
                                      scope: group.scope, projectTitle: group.projectTitle, description: group.description
                                    }); setShow(true);
                                  }}>Improve</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
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

export default ProjectRequests;
