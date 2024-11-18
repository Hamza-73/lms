import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Modal } from 'react-bootstrap';

const ProjectList = (props) => {

  const history = useNavigate();
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState({ supervisorName: '', supervisorId: '', groups: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [remarks, setRemarks] = useState();
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const getProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await fetch("http://localhost:5000/committee/groups", {
        method: "GET",
      });
      const json = await response.json();
      console.log('json is ', json); // Log the response data to see its structure
      setData(json);
    } catch (error) {
    }
  }

  const giveRemarks = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/committee/remarks/${id}`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ remarks: remarks })
        });
      const json = await response.json();
      console.log('json is', json)
      if (json.success) {
        NotificationManager.sucess('Remarks have been given');
      }

    } catch (error) {
      console.log('error is ', error)
    }
  }

  const handleRemarks = async (e, id) => {
    try {
      e.preventDefault()
      await giveRemarks(id);
      setRemarks('')
      getProjects();
      setShow(false);
    } catch (error) {
      console.log(' useerror is ', error)
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getDetail();
      getProjects();
    } else {
      history('/')
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const [userData, setUserData] = useState({ member: [] });

  const getDetail = async () => {
    try {
      setLoading(true);
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
        setLoading(false)
      }
    } catch (err) {
      console.log('error is in sidebar: ', err);
    }
  };

  const location = useLocation();
  const path = ['/studentMain/project', '/studentMain'];
  const showSidebar = path.includes(location.pathname);

  const [show, setShow] = useState(false);

  return (
    <>
      <div>
        <div className="remarks"  >
          <Modal show={show} onHide={() => {
            setShow(false);
          }}>
            <Modal.Header className="modal-header">
              <Modal.Title >Give Reamrks</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body">
              <form onSubmit={(e) => handleRemarks(e, selectedGroupId)}>

                <div className="mb-3">
                  <label htmlFor="remrks" className="form-label">Remarks</label>
                  <textarea className="form-control" id="remarks" name='remarks' value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </div>
                <Modal.Footer className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setRemarks(''); setShow(false) }}>Close</button>
                  <button type="submit" className="btn btn-success" disabled={!remarks}> Give Remarks </button>
                </Modal.Footer>
              </form>
            </Modal.Body>
          </Modal>
        </div>

      </div>
      <div className='container'>
        <h3 className='text-center'>Project List</h3>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search....."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {data.length > 0 ? (
          <div>
            {data.map((datas, groupIndex) => (
              <div key={groupIndex}>
                <h5 className='text-center' style={{ "borderBottom": "1px solid black", "marginBottom": "20px" }}>{datas.supervisorName}</h5>
                <table className='table' style={{ textAlign: "center" }}>
                  <thead className='thead-light'>
                    <tr>
                      <th>Name</th>
                      <th>Roll No</th>
                      <th>Project Title</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datas.groups.map((group, groupKey) => (
                      <tr key={groupKey}>
                        <td>
                          {group.students.map((student, studentKey) => (
                            <React.Fragment key={studentKey}>
                              {student.name}<br />
                            </React.Fragment>
                          ))}
                        </td>
                        <td>
                          {group.students.map((student, studentKey) => (
                            <React.Fragment key={studentKey}>
                              {student.rollNo}<br />
                            </React.Fragment>
                          ))}
                        </td>
                        <td>{group.projectTitle}</td>
                        <td>{group.remarks} {!showSidebar && userData.member.isAdmin && <div style={{ cursor: "pointer" }} >
                          <i className="fa-solid fa-pen-to-square" onClick={() => { setSelectedGroupId(group.groupId); setShow(true) }}></i>
                        </div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <div>No matching members found.</div>
        )}
      </div>
      <NotificationContainer />
    </>
  )
}

export default ProjectList;