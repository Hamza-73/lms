import React, { useEffect, useState } from 'react'
import Loading from './Loading';
import '../css/meeting.css'
import { Modal } from 'react-bootstrap';
import {server} from './server'

const Meeting = (props) => {
  const myStyle = {
    backgroundColor: "lightgrey",
    border: "2px solid lightgrey",
    borderRadius: "4px",
    textAlign: "center"
  };

  const [meeting, setMeeting] = useState({
    meetingGroup: "", meetingLink: "",
    purpose: "", meetingTime: "",
    meetingDate: "", meetingType: ""
  });

  const [edit, setEdit] = useState({
    meetingGroup: "", meetingLink: "",
    purpose: "", meetingTime: "",
    meetingDate: "", meetingType: ""
  });
  const [isLinkValid, setIsLinkValid] = useState(true);
  const [meetingId, setMeetingId] = useState('');
  const [data, setData] = useState({ meeting: [] });

  const getMeeting = async () => {

    try {
      const response = await fetch(`${server}/meeting/get-meeting`, {
        method: "GET",
        headers: {
          "Authorization": localStorage.getItem('token')
        },
      });
      const json = await response.json();
      // console.log('json meeting is in get ', json);

      setData(json)
    } catch (error) {

    }
  }

  const scheduleMeeting = async () => {
    try {
      // Check if required fields are present
      if (!meeting.meetingGroup || !meeting.purpose) {
        alert("Error: Meeting date, time, project title, and purpose are required.");
        return;
      }
      console.log('meeting is ', meeting)
      console.log('Meeting is scheduling');
      const response = await fetch(`${server}/meeting/meeting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify({
          projectTitle: meeting.meetingGroup,
          meetingLink: meeting.meetingLink,
          purpose: meeting.purpose,
          time: meeting.meetingTime,
          date: meeting.meetingDate,
          type: meeting.meetingType
        })
      });

      // console.log('Response status:', response.status);
      const json = await response.json();
      // console.log('JSON meeting is ', json);

      if (json.success) {
        // Clear the form fields
        setMeeting({
          meetingGroup: "", meetingLink: "",
          purpose: "", meetingTime: "",
          meetingDate: "", meetingType: ""
        });
        alert("Success: " + json.message);
        getMeeting();
      } else {
        alert("Error: " + json.message);
      }
    } catch (error) {
      console.log('Error dealing with requests', error);
    }
  };

  const editMeeting = async (e) => {
    try {
      e.preventDefault();
      // console.log('meeting starts', meetingId)
      const response = await fetch(`${server}/meeting/edit-meeting/${meetingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify({
          projectTitle: edit.meetingGroup, meetingLink: edit.meetingLink,
          time: edit.meetingTime, date: edit.meetingDate, type: edit.meetingType, purpose: edit.purpose
        })
      });
      // console.log('fetch ends');
      // console.log('Response status:', response.status);
      const json = await response.json();
      // console.log('json meeting editing is  ', json);

      if (json.success) {
        alert(`Meeting Edited Successfully`);
        // Update the state with the edited meeting
        getMeeting();
        setEdit({
          meetingGroup: "", meetingLink: "",
          purpose: "", meetingTime: "",
          meetingDate: "", meetingType: ""
        });
        setShow(false);
      } else {
        alert(json.message)
      }
    } catch (error) {
      console.log('error dealing with requests', error);
    }
  }

  const [dateError, setDateError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'meetingTime') {
      const currentDate = new Date();
      currentDate.setSeconds(0); // Set seconds to 0 for comparison
    
      const [hours, minutes] = value.split(':');
      const selectedTime = new Date(meeting.meetingDate); // Use meeting.meetingDate here
      selectedTime.setHours(hours, minutes);
      selectedTime.setSeconds(0); // Set seconds to 0 for comparison
    
      if (selectedTime < currentDate) {
        alert("Meeting time cannot be in the past.");
        return;
      }
    }

    if (name === 'meetingTime') {
      const currentDate = new Date();
      currentDate.setSeconds(0); // Set seconds to 0 for comparison

      const [hours, minutes] = value.split(':');
      const selectedTime = new Date(edit.meetingDate);
      selectedTime.setHours(hours, minutes);
      selectedTime.setSeconds(0); // Set seconds to 0 for comparison

      if (selectedTime < currentDate) {
        alert("Meeting time cannot be in the past.");
        return;
      }
    }

    if (name === 'meetingLink') {
      // Use a regular expression to check if the input value is a valid link
      const linkRegex = /^(http(s)?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ;,./?%&=]*)?$/;
      const isValid = linkRegex.test(value);
      setIsLinkValid(isValid);
    }

    setMeeting({ ...meeting, [name]: value });
    // console.log('meeting is ', meeting);
  };


  const deleteMeeting = async (id) => {
    try {
      // console.log('meeting id is ', id);
      const confirmed = window.confirm('Are You Sure You Want To Cancel');
      if (!confirmed) {
        return;
      } else {
        const response = await fetch(`${server}/meeting/delete-meeting/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": localStorage.getItem('token')
          }
        });
        const json = await response.json();
        // console.log("deleting meeting ", json);
        if (json) {
          // Remove the canceled meeting from the state
          getMeeting();
          alert(json.message);
        }
      }
    } catch (error) {
      console.log('error in deleting meeting', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if(name==='purpose'){
      const trimmedValue = e.target.value.replace(/[^A-Za-z ]/g, '') // Remove characters other than A-Z, a-z, and space
      .replace(/\s+/g, ' ');
      setEdit({ ...edit, [name]: trimmedValue });
    }

    if (name === 'meetingDate') {
      const selectedDate = new Date(value);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for comparison

      if (selectedDate < currentDate) {
        alert("Meeting date cannot be in the past.");
        return;
      }
    }

    if (name === 'meetingTime') {
      const currentDate = new Date();
      currentDate.setSeconds(0); // Set seconds to 0 for comparison

      const [hours, minutes] = value.split(':');
      const selectedTime = new Date(edit.meetingDate);
      selectedTime.setHours(hours, minutes);
      selectedTime.setSeconds(0); // Set seconds to 0 for comparison

      if (selectedTime < currentDate) {
        alert("Meeting time cannot be in the past.");
        return;
      }
    }

    if (name === 'meetingLink') {
      // Use a regular expression to check if the input value is a valid link
      const linkRegex = /^(http(s)?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ;,./?%&=]*)?$/;
      const isValid = linkRegex.test(value);
      setIsLinkValid(isValid);
    }

    setEdit({ ...edit, [name]: value }); // Update the 'edit' state here
  };

  const [userData, setUserData] = useState({ member: [] });
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(false);

  const giveReview = async (e) => {
    try {
      e.preventDefault();
      // console.log('review is ', review);
      const response = await fetch(`${server}/meeting/meeting-review/${meetingId}/${review}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify({ review: review })
      });
      const json = await response.json();
      // console.log('json is in giving meeting', json);
      if (json) {
        alert(json.message)
      }
      if (json.success) {
        setData((prevData) => ({
          ...prevData,
          meeting: prevData.meeting.filter((meeting) => meeting.meetingId !== meetingId)
        }));
        setShowreview(false);
      }
    } catch (error) {

    }
  }

  useEffect(() => {
    const getDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Token not found');
          return;
        }

        const response = await fetch(`${server}/supervisor/detail`, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });

        if (!response.ok) {
          console.log('Error fetching detail', response);
          return;
        }

        const json = await response.json();
        if (json) {
          // console.log('User data is: ', json);
          setUserData(json);
          setLoading(false);
        }
      } catch (err) {
        console.log('Error in sidebar: ', err);
      }
    };

    if (localStorage.getItem('token')) {
      setTimeout(() => {
        getDetail();
        getMeeting();
        getGroups();
      }, 700);
    }
  }, []);


  const meetingStyle = `
  .meeting-box {
    background-color: #f0f0f0;
    border: 2px solid #f0f0f0;
    border-radius: 4px;
    width : 230px;
    padding : 8px;
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .meeting-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: -10px; /* Counteract margin on individual boxes */
  }
  .item{
    display : flex;
    justify-content: space-between;
  }
  `;

  function showDiv(divId, element) {
    document.getElementById(divId).style.display =
      element.value == "Online" ? "block" : "none";
  }
  const handleEditMeeting = async (e) => {
    e.preventDefault();
    await editMeeting(e);
  }
  const [show, setShow] = useState(false);
  const [showReview, setShowreview] = useState(false);

  const [groups, setGroups] = useState({ projectTitles: [] });
  const getGroups = async () => {
    try {
      const response = await fetch(`${server}/meeting/supervisor`, {
        method: "GET",
        headers: {
          "Authorization": localStorage.getItem("token")
        }
      });
      const json = await response.json();
      // console.log('groups under me are ', json);
      setGroups(json);
    } catch (error) {
      console.log('error in getting groups ', error);
    }
  }

  function hasMeetingPassed(meetingDate, meetingTime) {
    // Convert meetingDate to a Date object
    const dateParts = meetingDate.split('T')[0].split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Months are zero-indexed
    const day = parseInt(dateParts[2], 10);

    const meetingDateTime = new Date(year, month, day);

    // Extract hours and minutes from meetingTime
    const [hours, minutes] = meetingTime.split(':');
    meetingDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    // Compare with the current date and time
    return meetingDateTime <= new Date();
  }

  return (
    <>
      <div className="meeting"  >
        <Modal show={show} onHide={() => {
          setShow(false);
        }}>
          <Modal.Header>
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleEditMeeting}>

              <div className="mb-3">
                <label htmlFor="name" className="form-label">Project Title</label>
                <input type="text" className="form-control" id="name" name='meetingGroup' value={edit.meetingGroup} onChange={handleEditChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Purpose</label>
                <input type="text" className="form-control" id="purpose" name='purpose' value={edit.purpose} onChange={handleEditChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">Date</label>
                <input type="date" className="form-control" id="meetingDate" name='meetingDate' value={edit.meetingDate} onChange={handleEditChange} />
                {dateError && <div className="text-danger">Select a valid Date</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="time" className="form-label">Time</label>
                <input type="time" className="form-control" id="time" name='meetingTime' value={edit.meetingTime} onChange={handleEditChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="type" className="form-label">Type</label>
                <div className="select">
                  <input
                    type="radio"
                    name="meetingType"
                    value="In Person"
                    checked={edit.meetingType === 'In Person'}
                    onChange={handleEditChange}
                  />
                  <label htmlFor="inperson" className="mx-2">
                    In Person
                  </label>
                </div>
                <div className="select">
                  <input
                    type="radio"
                    name="meetingType"
                    value="Online"
                    checked={edit.meetingType === 'Online'}
                    onChange={handleEditChange}
                  />
                  <label htmlFor="online" className="mx-2">
                    Online
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="meetingLink" className="form-label">Link</label>
                <input type="text" className="form-control" name='meetingLink' value={edit.meetingLink} disabled={edit.meetingType === 'In Person'} onChange={handleEditChange} />
                {!isLinkValid && <div className="text-danger">Please enter a valid link.</div>}
              </div>
              <Modal.Footer>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShow(false);
                }}>Close</button>

                <button type="submit" className="btn btn-success" disabled={!(edit.meetingGroup)
                  || !(edit.meetingTime)
                }>
                  Edit
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>
      <div className="review"  >
        <Modal show={showReview} onHide={() => {
          setShowreview(false);
        }}>
          <Modal.Header >
            <Modal.Title className="modal-title" >Give Review</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <form onSubmit={giveReview}>
              <div className="mb-3">
                <label>
                  <input
                    type="radio"
                    name="reviewOption"
                    value="true"
                    onChange={() => setReview(true)}
                  />
                  Successful
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name="reviewOption"
                    value="false"
                    onChange={() => setReview(false)}
                  />
                  Not Successful
                </label>
              </div>
              <Modal.Footer className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={() => { setReview(null); setShowreview(false); }}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-success" disabled={review === null}>
                  Give Reviews
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>

      {!loading ?
        <div>
          <div className="container d-flex" style={{ height: "500px" }}>
            <div>
              <h1>Link Information</h1>
              <div>
                <textarea name="purpose" value={meeting.purpose} id="" placeholder='Purpose of Meeting' cols="30" rows="2" onChange={handleInputChange} style={myStyle}></textarea> <br />
                <select name="meetingGroup" className="form-select" onChange={handleInputChange} value={meeting.meetingGroup}>
                  <option value="">Select Group</option>
                  {
                    groups.projectTitles && groups.projectTitles.map((group, groupKey) => {
                      return (<option key={groupKey} value={group}>{group}</option>)
                    })
                  }
                </select>
              </div>

              <h6>Select a meeting type</h6>

              <h4>Select a meeting type</h4>{" "}
              <select
                id="test"
                name="meetingType"
                value={meeting.meetingType}
                onChange={(e) => { handleInputChange(e); showDiv("link", e.target); }}
              >
                <option id="test">None</option>
                <option
                  id="test"
                  value="In Person"
                >
                  In Person
                </option>
                <option id="test" value="Online">
                  Online
                </option>
              </select>{" "}
              <br />
              <br />
              <div className="link" id="link">
                <h4>
                  <i className="fas fa-video" style={{ fontSize: "24px" }}></i>
                  &ensp;Using
                </h4>
                <select id="test" name="meetingType" onChange={handleInputChange} value={meeting.meetingType}>
                  <option value="Google Meet">
                    Google Meet
                  </option>
                  <option value="Microsoft Teams">
                    Microsoft Teams
                  </option>
                  <option value="Zoom">
                    Zoom
                  </option>
                </select>{" "}
                <br />
                <textarea
                  name="meetingLink"
                  className="purpose"
                  placeholder="Enter the link of the meeting"
                  disabled={meeting.meetingType === "In Person"}
                  onChange={handleInputChange}
                  value={meeting.meetingLink}
                ></textarea>
              </div>

              <div style={{ marginTop: "20px" }}>
                <h6 htmlFor="appt">Choose a time and date for your meeting:</h6>{" "}
                <input
                  type="date"
                  className="purpose1"
                  htmlFor="appt"
                  placeholder="Meeting Date"
                  onChange={handleInputChange}
                  name="meetingDate"
                  value={meeting.meetingDate}
                />{" "}
                <br />
                <input
                  className="purpose1"
                  type="time"
                  id="appt"
                  name="meetingTime"
                  min="08:00"
                  max="18:00"
                  value={meeting.meetingTime}
                  onChange={handleInputChange}
                  required
                />{" "}
                {dateError && <div className="text-danger">Select a valid Date</div>}
              </div>{" "}
              <br />
              <div className="link" id="link">
                <h1>Link</h1>
                <textarea name="meetingLink" id="" disabled={meeting.meetingType === 'In Person'} cols="35" rows="2" onChange={handleInputChange} value={meeting.meetingLink} style={myStyle}></textarea>
              </div>
              {!isLinkValid && <div className="text-danger">Please enter a valid link.</div>}

              <button className="btn btn-danger" style={{ background: "maroon" }}
                disabled={dateError || !meeting.meetingType || !meeting.meetingDate || !meeting.meetingGroup || !meeting.meetingTime}
                onClick={scheduleMeeting} >Schedule Meeting</button>

            </div>

            {data.meeting.length > 0 && <div style={{
              position:"relative", marginLeft:"65px"
            }} className="meeting-schedule">
              <style>{meetingStyle}</style>
              <h3 className="text-center">Scheduled Meetings</h3>
              <div className="my-3">
                <div className="meeting-row">
                  {data.meeting.map((meeting, index) => (
                    <div className="meeting-box" key={index}>
                      <div className="contaner">
                        {/* Meeting details */}
                        <div className="item">
                          <p>Group</p>
                          <p style={{ fontSize: "13px", position:"relative", marginLeft:"8px" }}>{meeting.meetingGroup}</p>
                        </div>
                        <div className="item">
                          <p>Time</p>
                          <p>{meeting.meetingTime}</p>
                        </div>
                        <div className="item">
                          <p>Date</p>
                          <p>
                            {meeting && meeting.meetingDate
                              ? new Date(meeting.meetingDate).toLocaleDateString(
                                'en-US'
                              )
                              : '----'}
                          </p>
                        </div>
                        {meeting && meeting.purpose && <div className="item">
                          <p>Purpose</p>
                          <p
                            style={{ cursor: "pointer", fontSize: "15px" }}
                            onClick={() => {
                              alert(meeting.purpose)
                            }}>Click Here To View</p>
                        </div>}
                        {meeting && meeting.meetingLink && (
                          <div className="item meeting-link">
                            <p>Link</p>
                            <a
                              href={
                                meeting.meetingLink.startsWith('http')
                                  ? meeting.meetingLink
                                  : `http://${meeting.meetingLink}`
                              }
                              target="_blank"
                            >
                              Link
                            </a>
                          </div>
                        )}
                        <div className='d-grid gap-2 d-md-flex justify-content-md-end'>
                          {!hasMeetingPassed(meeting.meetingDate, meeting.meetingTime) ?
                            <>
                              <button
                                className="btn btn-danger btn-sm"
                                data-toggle="modal"
                                data-target="#exampleModal"
                                onClick={() => {
                                  setMeetingId(meeting.meetingId);
                                  setEdit({
                                    meetingGroup: meeting.meetingGroup || '', // Ensure it's defined or set to an empty string
                                    meetingLink: meeting.meetingLink,
                                    meetingTime: meeting.meetingTime || '', // Ensure it's defined or set to an empty string
                                    meetingDate: meeting.meetingDate,
                                    purpose: meeting.purpose
                                  });
                                  setShow(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setMeetingId(meeting.meetingId);
                                  deleteMeeting(meeting.meetingId);
                                }}
                              >
                                Cancel
                              </button>
                            </> : (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setMeetingId(meeting.meetingId);
                                  setShowreview(true);
                                }}
                              >
                                Review
                              </button>
                            )
                          }

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>}

          </div>
        </div > : <Loading />
      }</>
  )
}

export default Meeting
