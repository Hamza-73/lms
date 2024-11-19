import React, { useEffect, useState } from 'react';
import 'react-calendar/dist/Calendar.css';
import Loading from '../Loading';
import 'react-clock/dist/Clock.css';
import 'react-clock/dist/Clock.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Modal } from 'react-bootstrap';
import {server} from '../server'

const Event = (props) => {
  const [data, setData] = useState({ vivas: [] });
  const [committee, setCommittee] = useState({ members: [] });
  const [external, setExternal] = useState({ members: [] });

  const [viva, setViva] = useState({
    projectTitle: '', vivaDate: new Date(), vivaTime: '',
    external: "", chairperson : ""
  });
  const [loading, setLoading] = useState(false);

  const [isInvalidDate, setIsInvalidDate] = useState(false);

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

  const editViva = async (e) => {
    try {
      e.preventDefault();
      const response = await fetch(`${server}/viva/edit`, {
        method: "PUT",
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
        getVivas();
        setShow(false);
      } else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error scheduling viva', error);
      NotificationManager.error(`Some error occurred try to reload the page/ try again`);
    }
  }

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

  const getVivas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${server}/viva/vivas`, {
        method: 'GET',
      });
      const json = await response.json();
      console.log('json is ', json)

      if (json.success) {
        setData(json);
      }
      setLoading(false)
    } catch (error) {
      console.log('error dealing with requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // setLoading(true);
    if (localStorage.getItem('token')) {
      setTimeout(() => {
        getVivas();
        getCommittee();
        getExternal();
      }, 1500);
    }
  }, []);

  const handleChange1 = (e) => {
    setViva({ ...viva, [e.target.name]: e.target.value });
  };

  const [show, setShow] = useState(false);
  const [supervisor , setSupervisor] = useState("")

  return (
    <div>

      <div className="viva">
        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Header>
            <Modal.Title className="modal-title">Schedule Viva</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <form onSubmit={(e) => editViva(e)}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Project Title
                </label>
                <input type="text" className="form-control" disabled={true} id="projectTitle" name="projectTitle" value={viva.projectTitle} onChange={handleChange1} />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Viva Date
                </label>
                <br />
                <input type="date" name='vivaDate' value={viva.vivaDate} onChange={handleChange1} />
              </div>
              {isInvalidDate && (
                <div className="text-danger">Please enter a valid date (not in the past).</div>
              )}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Viva Time
                </label>
                <div>
                  <input type="time" name='vivaTime' value={viva.vivaTime} onChange={handleChange1} />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="external" className="form-label">
                  External
                </label>
                <select className='form-select' name='external' onChange={handleChange1} value={viva.external}>
                  <option value="">Select External Member</option>
                  {external.members && external.members.map((member, index) => (
                    <option key={index} value={member.username}>{member.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="chairperson" className="form-label">
                  ChairPerson
                </label>
                  <input type="text" className="form-control" name='chairperson' value={viva.chairperson} onChange={handleChange1} />
              </div>

              <Modal.Footer className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShow(false);
                }}>
                  Close
                </button>
                <button type="submit" className="btn btn-danger" style={{ background: 'maroon' }}
                  disabled={!viva.vivaDate || !viva.vivaTime || !viva.projectTitle || !viva.external || !viva.chairperson}
                >
                  Schedule
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>
      <>
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="container" style={{ width: '90%' }}>
              <h3 className="text-center">Scheduled Viva</h3>
              <div className="mb-3"></div>
              {data.vivas.length > 0 ? (
                <table className="table text-center table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Supervisor</th>
                      <th scope="col">Student Name</th>
                      <th scope="col">Project Title</th>
                      <th scope="col">External</th>
                      <th scope="col">Viva Date</th>
                      <th scope="col">Viva Time</th>
                      <th scope="col">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {data.vivas.map((val, key) => (
                      <tr key={key}>
                        <td>{val.sup}</td>
                        <td>
                          <div>
                            {val.students.map((student, studentKey) => (
                              <React.Fragment key={studentKey}>{student.name} <br /></React.Fragment>
                            ))}
                          </div>
                        </td>
                        <td>{val.projectTitle}</td>
                        <td>{val.externalName}</td>
                        <td>{new Date(val.vivaDate).toLocaleDateString('en-GB')}</td>
                        <td>{val.vivaTime}</td>
                        <td data-toggle="modal" data-target="#exampleModal1" onClick={() => {
                          setViva({
                            projectTitle: val.projectTitle, date: val.vivaDate,
                            time: val.vivaTime, external: val.external,chairperson:val.chairperson
                          });
                          setShow(true);
                        }}
                          disabled={val.isViva}><i class="fa-solid fa-pen-to-square"></i></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <h1 style={{ position: "absolute", transform: "translate(-50%,-50%", left: "50%", top: "50%" }}>No Vivas Scheduled Yet</h1>
              )}
            </div>
          </>
        )}

        <NotificationContainer />
      </>
    </div>
  );
};

export default Event;