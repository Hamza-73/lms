import React, { useEffect, useState } from 'react'
import '../../css/group.css'
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Modal } from 'react-bootstrap';
import {server} from '../server'

const MyGroup = (props) => {
  const [group, setGroupDetails] = useState({
    success: false,
    group: {
      myDetail: [{ name: "", rollNo: "", myId: "" }],
      groupId: "", supervisor: "", supervisorId: "",
      projectTitle: "", projectId: "",
      groupMember: [{ userId: "", name: "", rollNo: "", _id: "" }],
      proposal: false, documentation: false, docDate: "----",
      propDate: "", viva: ""
    }
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState();


  const groupDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      console.log('before fetch')
      const response = await fetch(`${server}/student/my-group`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token
        }
      });
      console.log('after fetch')
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const json = await response.json();
      if (!json) {
        console.log('group response is ', response);
      } else {
        console.log('json is ', json);
        setGroupDetails(json);
      }
    } catch (error) {
      console.log('error fetching group ', error)
    }
  }
  useEffect(() => {

    if (localStorage.getItem('token')) {
      setLoading(true)
      setTimeout(() => {
        groupDetail();
        setLoading(false)
        console.log('details is in grpouyp ', group.group)
      }, 1300)
    }
  }, [])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Check if a file is selected
    if (selectedFile) {
      // Check file size (in bytes)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size <= maxSize) {
        setFile(selectedFile);
      } else {
        // File size exceeds the limit
        NotificationManager.error('File size must be less than 5MB.');
        e.target.value = null; // Clear the file input
      }
    }
  }

  const requestextension = async (e) => {
    try {
      e.preventDefault();
      const response = await fetch(`${server}/student/extension`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({ reason: reason })
      });
      const json = await response.json();
      console.log('json in sending extension is ', json);
      alert(json.message);
      setShow(false);
    } catch (error) {
      console.log('error in extension', error);
    }
  }

  const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes

  const upload = async (e) => {
    e.preventDefault();
    try {

      const formData = new FormData();
      if (file) {
        formData.append('doc', file); // Make sure to match the field name with your backend route
      }
      formData.append('comment', comment);
      if (link) {
        formData.append('link', link);
      }
      // Check if the file size is within the allowed limit
      if (file && file.size > maxFileSize) {
        console.log('File size exceeds the limit of 5 MB.');
        return;
      }

      const response = await fetch(`${server}/student/doc`, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
        body: formData, // Set the FormData object as the body
      });
      const json = await response.json();
      console.log('response in uploading proposal is', json);
      if (!json.success) {
        console.log('json is ');
        NotificationManager.error(json.message);
      }
      if (json.success) {
        setShowUpload(false);
        NotificationManager.success('File Uploaded successfully');
        // Update the state with the uploaded file URL
        const newDocument = {
          docLink: json.url ? json.url : "", // Document URL
          review: '', // Empty review,
          comment: comment, link: json.link ? json.link : ""
        };
        setnewComment(comment)
        setGroupDetails((prevGroup) => ({
          ...prevGroup,
          group: {
            ...prevGroup.group,
            docs: [...(prevGroup.group.docs || []), newDocument],
          },
        }));
        setFile(null);
        setComment('')
        setLink("");
        setFile(null);
      }
    } catch (error) {
      console.log('error in uploading file', error);
    }
  };

  const [link, setLink] = useState('');
  const [invalidLink, setInvalidLink] = useState(false);
  const handleLink = (e) => {
    setInvalidLink(false);
    setLink(e.target.value);

    // Use a regular expression to check if the input value is a valid link
    const linkRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ;,./?%&=]*)?$/;
    const isValid = linkRegex.test(e.target.value.trim());
    setInvalidLink(!isValid);
  };


  const requestMeeting = async () => {
    try {
      const response = await fetch(`${server}/student/request-meeting`, {
        method: "POST",
        headers: {
          "Authorization": localStorage.getItem('token')
        }
      });
      const json = await response.json();
      console.log('json in requesting meeting is ', json);
      alert(json.message);
    } catch (error) {
      console.log('error in requesting meeting', error);
    }
  }

  const meetingStyle = `
  .meeting-box {
    background-color: #ffffff;
    border: 1px solid #d1d1d1;
    border-radius: 6px;
    width: 250px;
    height: 100px;
    padding: 16px;
    margin: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .meeting-row {
    text-align: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .meeting-box a {
    text-decoration: none;
    color: #007bff;
  }
`;

  const myStyle = `
.meeting-box {
  background-color: #ffffff;
  border: 1px solid #d1d1d1;
  border-radius: 6px;
  width: 260px;
  height: 210px;
  padding: 16px;
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
  const [review, setReview] = useState('');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [newComment, setnewComment] = useState('');

  const [show, setShow] = useState(false);
  const [links, setLinks] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div>
      <Modal show={showUpload} onHide={() => {
        setShowUpload(false);
      }}>
        <Modal.Header>
          <Modal.Title>Upload Documentation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <form onSubmit={upload}>
              <div className="mb-3">
                <label htmlFor="">Link</label>
                <input type='text' class="form-control" name="link" value={link} onChange={handleLink} ></input>
                {invalidLink && <div style={{ color: "red" }}>Enter A Valid Link</div>}
              </div>
              <div className="mb-3">
                <div class="form-floating">
                  <textarea class="form-control" value={comment} placeholder="Leave a comment here" onChange={(e) => {
                    setComment(e.target.value)
                  }} id="floatingTextarea"></textarea>
                  <label for="floatingTextarea">Comments</label>
                </div>
              </div>
              <br />
              <input type="file" onChange={(e) => { handleFileChange(e) }} accept=".pdf, .png, .jpg, .jpeg, .webp" />
              <Modal.Footer>
                <button className="btn btn-secondary" type='button' onClick={() => {
                  setShowUpload(false);
                }}>Close</button>
                <button type="submit" disabled={
                  (!link && !file) || !comment
                } className="btn" style={{ background: "maroon", color: "white" }}>
                  Submit
                </button>
              </Modal.Footer>
            </form>
          </>
        </Modal.Body>
      </Modal>

      <div className="modal fade" id="exampleModal1" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Review</h1>
            </div>
            <div className="modal-body">
              <>
                <form>
                  <label htmlFor="">Review</label> <br />
                  <textarea className='form-control' value={review ? review : "No Reviews Yet"} disabled={true} />
                  <br />
                  <label htmlFor="">Comment</label> <br />
                  <textarea className='form-control' value={newComment ? newComment : ""} disabled={true} />
                  <br />
                  <label htmlFor="">Link</label> <br />
                  <textarea className='form-control' value={links} />
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close"> Close</button>
                  </div>
                </form>
              </>
            </div>
          </div>
        </div>
      </div>

      <Modal show={show} onHide={() => {
        setShow(false);
      }}>
        <Modal.Header>
          <Modal.Title>Extension Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <form onSubmit={requestextension}>
              <textarea className='form-control' value={reason} onChange={(e) => setReason(e.target.value)} />
              <Modal.Footer>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShow(false);
                }}> Close</button>
                <button className="btn" style={{ background: "maroon", color: "white" }} disabled={!reason}>Request</button>
              </Modal.Footer>
            </form>
          </>
        </Modal.Body>
      </Modal>

      {!loading ? <div className={`${group.group ? 'container' : ""}`}>
        {
          group.group ? <>
            <div className="upperpart">
              <div className="proj-detail d-flex justify-content-between">
                <h4>
                  <strong>Project Title:</strong>
                </h4>
                <h5 style={{
                  fontStyle: "italic",
                  textShadow: "0.5px 0.5px black",
                }}>{group.group.projectTitle || "N/A"}</h5>
              </div>
            </div>

            <div className="">
              <div>
                <h4>
                  <i
                    class="fas fa-user"
                    style={{ fontSize: "35px", color: "maroon" }}
                  ></i>
                  &ensp;
                  {group.group.supervisor || "N/A"}
                </h4>
              </div>

              <div>
                <br></br>
                <h5
                  style={{
                    fontStyle: "italic",
                    textShadow: "0.5px 0.5px black",
                  }}
                >
                  <i
                    class="fas fa-user"
                    style={{ fontSize: "35px", color: "maroon" }}
                  ></i>
                  &ensp;
                  {group.group.myDetail[0] ? group.group.myDetail[0].name : ""}{" "}
                  &nbsp;{" "}
                  {group.group.myDetail[0] ? group.group.myDetail[0]?.rollNo : ""}{" "}
                  &ensp;

                  <i
                    class="fas fa-user"
                    style={{ fontSize: "35px", color: "maroon" }}
                  ></i>
                  &ensp;
                  {group.group.groupMember[0] ? group.group.groupMember[0].name : "No Member Yet"}{" "}
                  &nbsp;{" "}
                  {group.group.groupMember[0] ? group.group.groupMember[0]?.rollNo : ""}{" "}
                  &ensp;
                </h5>
              </div>
            </div>

            <div className="last">
              <div className='d-flex'>
                {(group.group.meetingDate && new Date(group.group.meetingDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)) && <div>
                  <div className="notify">
                    <style>{myStyle}</style>
                    <div>
                      <div>
                        <div>
                          <div className="meeting-box" style={{ height: "210px" }}>
                            <div className="contaner">
                              <h4 className='text-center'>Meeting</h4>
                              <div className="items">
                                <h5>Time</h5>
                                <h6>{group.group.meetingTime ? group.group.meetingTime : "==="}</h6>
                              </div>
                              <div className="items">
                                <h5>Date</h5>
                                <h6>
                                  {group.group.meetingDate
                                    ? new Date(group.group.meetingDate).toLocaleDateString(
                                      'en-US'
                                    )
                                    : '----'}
                                </h6>
                              </div>
                              {group.group.purpose && <div className="items">
                                <h5>Purpose</h5>
                                <p
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    alert(group.group.purpose)
                                  }}
                                >Click here to view</p>
                              </div>}
                              {group.group.meetingLink && (
                                <div className="items">
                                  <h5>Link</h5>
                                  <a
                                    href={
                                      group.group.meetingLink.startsWith('http')
                                        ? group.group.meetingLink
                                        : `http://${group.group.meetingLink}`
                                    }
                                    target="_blank"
                                  >
                                    Link
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
                {group.group.viva && group.group.viva.vivaDate &&
                  <div className="notify">
                    <style>{myStyle}</style>
                    <div>
                      <div className="meeting-box" style={{ width: "250px", height: "210px" }}>
                        <div className="contaner">
                          <h4 className='text-center'>Viva</h4>
                          <div className="items">
                            <h6>Date</h6>
                            <p>{group.group.viva.vivaDate && new Date(group.group.viva.vivaDate).toLocaleDateString('en-US')}</p>
                          </div>
                          <div className="items">
                            <h6>Time</h6>
                            <p>{group.group.viva.vivaTime && group.group.viva.vivaTime} </p>
                          </div><div className="items">
                            <h6>Chair Person</h6>
                            <p style={{ fontSize: "14px" }}>{group.group.viva.chairperson} </p>
                          </div><div className="items">
                            <h6>External</h6>
                            <p style={{ fontSize: "14px", position: "relative", marginLeft: "3px" }}>{group.group.viva.externalName} </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
              <div className="meeting-row">
                {group.group &&
                  group.group.docs &&
                  group.group.docs.length > 0 &&
                  group.group.docs.map((grp, grpKey) => {
                    return (
                      <div className="meeting-box" key={grpKey + 1}>
                        <style>{meetingStyle}</style>
                        <div className="item">
                          {grp.docLink && <a target="_blank" href={grp.docLink}>
                            View Uploaded Doc
                          </a>}
                          <button className="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal1" onClick={() => { setReview(grp.review); setLinks(grp.link); setnewComment(grp.comment) }}>See Details</button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <button className="btn btn-danger" disabled={group.group.viva && group.group.viva.vivaDate && (new Date() > new Date(group.group.viva.vivaDate))} onClick={requestMeeting}>Request Meeting</button>

              <button className="btn btn-danger" onClick={() => {
                setShow(true);
              }} >Extension Request</button>

              <button className="btn btn-danger" disabled={group.group.viva && group.group.viva.vivaDate && (new Date() > new Date(group.group.viva.vivaDate))} onClick={() => {
                setShowUpload(true);
              }}>Upload Document</button>
            </div>
          </> : <h1 className='text-center my-4' style={{ position: "absolute", transform: "translate(-50%,-50%", left: "50%", top: "50%" }}>You're currently not enrolled in any Group.</h1>
        }
      </div> : <Loading />
      }

      <NotificationContainer />
    </div>
  )
}

export default MyGroup