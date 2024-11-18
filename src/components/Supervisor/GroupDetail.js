import React, { useEffect, useState } from "react";
import Loading from "../Loading";

const GroupDetail = () => {
  const [group, setGroup] = useState({
    groups: [
      {
        projects: [
          {
            projectTitle: '',
            students: [{ name: '', rollNo: '', userId: '', _id: '' },
            { name: '', rollNo: '', userId: '', _id: '' },
            ],
          },
        ],
      },
    ],
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [review, setReview] = useState({ text: "", index: "" });

  const handleCloseModal = (id) => {
    document.getElementById(id).classList.remove("show", "d-block");
    document.querySelectorAll(".modal-backdrop")
      .forEach(el => el.classList.remove("modal-backdrop"));
  }

  const giveReviews = async (e) => {
    try {
      e.preventDefault();
      const response = await fetch(`http://localhost:5000/supervisor/reviews/${groupId}/${review
        .index}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify({ review: review.text })
      });
      const json = await response.json();
      if (json.success) {
        alert(json.message);
        // Update the reviews state with the new review
        setReview([...review, review.text]);
        handleCloseModal("exampleModal")
      }
    } catch (error) {
      console.log('error in giving reviews', error);
    }
  }

  const getGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      const response = await fetch('http://localhost:5000/supervisor/my-groups', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token,
        },
      });
      const json = await response.json();
      console.log('json is ', json)
      setGroup(json);
      setLoading(false);
    } catch (error) {
      console.log('error is in groupDetail ', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getGroup();
    }, 2000);
  }, []);

  const handleNextClick = () => {
    // Increment the currentIndex to show the details of the next group
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };
  const handlePrevClick = () => {
    // Increment the currentIndex to show the details of the next group
    setCurrentIndex((prevIndex) => prevIndex - 1);
  };

  const meetingStyle = `
  .meeting-box {
    background-color: #ffffff;
    border: 1px solid #d1d1d1;
    border-radius: 6px;
    width: 200px;
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

  const handleChange = (e) => {
    setReview({ ...review, [e.target.name]: e.target.value });
  }

  const handleClose = (id, action) => {
    setReview({ text: "", index: "" });
    setGroupId('');
  }

  const [comment, setComment] = useState('');
  const [link, setLink] = useState("");

  const currentGroup = group.groups.length > 0 ? group.groups[currentIndex] : {};
  return (
    <div>
      {!loading ? (
        <>
          <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">
                    Review
                  </h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <>
                    <form onSubmit={giveReviews}>
                      <div className="mb-3">
                        <label htmlFor="exampleInputEmail163" className="form-label">
                          Comment
                        </label>
                        <textarea className="form-control" id="text" name="text" value={comment} disabled={true} />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="exampleInputEmail163" className="form-label">
                          Review
                        </label>
                        <textarea className="form-control" id="text" name="text" value={review.text} onChange={handleChange} />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="exampleInputEmail163" className="form-label">
                          Link
                        </label>
                        <textarea className="form-control" id="text" name="link" value={link} />
                      </div>

                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close" onClick={handleClose}> Close</button>
                        <button type="submit" className="btn" style={{ background: 'maroon', color: 'white' }}>
                          Give Review
                        </button>
                      </div>
                    </form>
                  </>
                </div>

              </div>
            </div>
          </div>
          {group.groups.length > 0 ? (
            <div className="container" style={{ border: "none", height: "700px", width: "1000px" }}>
              <div className="upperpart">
                <div className="proj-detail d-flex justify-content-between">
                  <h4>
                    <strong>Project Title:</strong>
                  </h4>
                  <h5 style={{
                    fontStyle: "italic",
                    textShadow: "0.5px 0.5px black",
                  }}>{currentGroup.projects[0].projectTitle || "N/A"}</h5>
                </div>
              </div>
              <div className="">
                <div>
                  <h4>
                    <i
                      className="fas fa-user"
                      style={{ fontSize: "35px", color: "maroon" }}
                    ></i>
                    &ensp;
                    {currentGroup.supervisor || "N/A"}
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
                      className="fas fa-user"
                      style={{ fontSize: "35px", color: "maroon" }}
                    ></i>
                    &ensp;
                    {currentGroup.projects[0].students[0]
                      ? currentGroup.projects[0].students[0].name
                      : "No Student Yet"}{" "}
                    &nbsp;{" "}
                    {currentGroup.projects[0].students[0]
                      ? currentGroup.projects[0].students[0].rollNo
                      : ""}{" "}
                    &ensp;

                    <i
                      className="fas fa-user"
                      style={{ fontSize: "35px", color: "maroon" }}
                    ></i>
                    &ensp;
                    {currentGroup.projects[0].students[1]
                      ? currentGroup.projects[0].students[1].name
                      : "No Student Yet"}{" "}
                    &nbsp;{" "}
                    {currentGroup.projects[0].students[1]
                      ? currentGroup.projects[0].students[1].rollNo
                      : ""}
                  </h5>
                </div>
              </div>

              <div className="last">
                <div className='meeting-row'>
                  {(currentGroup.docs && currentGroup.docs.length) > 0 ? (
                    currentGroup.docs.map((doc, docKey) => (
                      <div className="meeting-box" key={docKey}>
                        <style>{meetingStyle}</style>
                        <div className='item'>
                          {doc.docLink && <a target='_blank' href={doc.docLink}>View Uploaded Doc</a>}
                          <button className="btn btn-sm btn-danger" data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            onClick={() => {
                              setGroupId(currentGroup._id);
                              setComment(doc.comment)
                              setReview({ index: docKey, text: doc.review });
                              setLink(doc.link)
                            }}>Reviews/Comment</button>
                        </div>
                      </div>
                    ))
                  ) : ("")}
                </div>
              </div>
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-success"
                  onClick={handlePrevClick}
                  disabled={currentIndex <= 0}
                >
                  {" "}
                  Prev{" "}
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleNextClick}
                  disabled={currentIndex === group.groups.length - 1}
                >
                  {" "}
                  Next{" "}
                </button>
              </div>
            </div>
          ) : (
            <h2 className="text-center" style={{ position: "absolute", transform: "translate(-50%,-50%", left: "50%", top: "50%" }}>
              You currently have no group in supervision.
            </h2>
          )}
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default GroupDetail;