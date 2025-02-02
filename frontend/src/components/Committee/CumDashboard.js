import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Modal } from 'react-bootstrap';
import {server} from '../server'

const CumDashboard = (props) => {
  const history = useNavigate();
  const ref = useRef(null);

  const [rules, setRules] = useState({ roles: [] });
  const [role, setRole] = useState({ role: '', rules: [] });
  const [defineRole, setDefineRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalRules, setModalRules] = useState([]);
  const [editRuleIndex, setEditRuleIndex] = useState(-1);
  const [check, setCheck] = useState(false);
  const [roles, setRoles] = useState({ roles: [] })
  const getRules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      setLoading(true);
      const response = await fetch(`${server}/rules/get-all-roles`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });
      const json = await response.json();
      console.log('rules are ', json)
      setRules(json);
      setLoading(false);
    } catch (error) {
      console.log('error', error);
    }
  }
  const getRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      setLoading(true);
      const response = await fetch(`${server}/rules/get-roles`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });
      const json = await response.json();
      console.log('roles are ', json)
      setRoles(json);
      setLoading(false);
    } catch (error) {
      console.log('error', error);
    }
  }

  const getRole = async (roleName) => {
    try {
      setCheck(true);
      const response = await axios.get(`${server}/rules/get-rules/${roleName}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setLoading(true);
      const json = await response.data;
      setRole(json);
      setModalRules(json.rules); // Update modalRules with the new rules
      NotificationManager.sucess('Rules fetched successfully');
    } catch (error) {
      console.log('error', error);
    }
  }

  const editRule = async (e) => {
    try {
      e.preventDefault();
      setCheck(true);
      const response = await axios.put(`${server}/rules/edit-rules/${defineRole}`, {
        rules: modalRules,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.data;
      if (json) {
        NotificationManager.success('Rules Edited Sucessfully');
        // Reset state variables to their initial values
        setDefineRole('');
        setModalRules([]);
        setEditRuleIndex(-1);
        getRules();
        setShowEdit(false);
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
      setCheck(false);
    }
  }


  const addRuleInput = () => {
    // Add an empty rule to modalRules when the user clicks "Add Rule"
    setModalRules([...modalRules, '']);
  }

  const deleteRuleInput = (index) => {
    // Remove the rule at the specified index when the user clicks "Delete"
    const updatedRules = modalRules.filter((_, i) => i !== index);
    setModalRules(updatedRules);
  }

  const handleRuleChange = (index, newValue) => {
    // Update the rule at the specified index when the user types in the input
    const updatedRules = [...modalRules];
    updatedRules[index] = newValue;
    setModalRules(updatedRules);
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getDetail();
      getRules();
      getRoles();
    } else {
      history('/');
    }
  }, []);

  const capitilize = (sentence) => {
    const words = sentence.split(' ');
    const capitalizedWords = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return capitalizedWords.join(' ');
  }

  // Function to reset the modal state
  const resetModalState = () => {
    setDefineRole('');
    setModalRules([]);
    setEditRuleIndex(-1);
  };

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

  const [newRole, setNewRole] = useState('');
  const [newRules, setNewRules] = useState(['']);
  const [showDefineRoleModal, setShowDefineRoleModal] = useState(false);

  const defineNewRole = async () => {
    try {
      if (!newRole || !newRules) {
        NotificationManager.error('Please provide both role and rules.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }

      const response = await fetch(
        `${server}/rules/add-role`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify(
            {
              role: newRole.toLowerCase(),
              rules: newRules,
            },)
        },
      );
      const json = await response.json();
      console.log('json is ', json)
      if (json.success) {
        NotificationManager.success('New role and rules defined successfully');
        setShowDefineRoleModal(false);
        setNewRole('');
        setNewRules('');
        // Refresh the existing roles and rules after defining a new role
        getRules();
        getRoles();
        handleCloseModal("defineRoleModal")
      } else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  const handleCloseModal = (id) => {
    document.getElementById(id).classList.remove("show", "d-block");
    document.querySelectorAll(".modal-backdrop")
      .forEach(el => el.classList.remove("modal-backdrop"));
  }
  const addNewRuleInput = () => {
    // Add an empty rule to newRules when the user clicks "Add Rule"
    setNewRules([...newRules, '']);
  };

  const handleNewRuleChange = (index, newValue) => {
    // Update the rule at the specified index when the user types in the input
    const updatedRules = [...newRules];
    updatedRules[index] = newValue;
    setNewRules(updatedRules);
  }; const deleteNewRuleInput = (index) => {
    // Remove the new rule at the specified index when the user clicks "Delete"
    const updatedNewRules = newRules.filter((_, i) => i !== index);
    setNewRules(updatedNewRules);
  };

  const deleteRules = async (e) => {
    try {
      const response = await fetch(`${server}/rules/delete-rule/${defineRole}`, {
        method: "DELETE",
      });
      const json = await response.json();
      if (json.success) {
        NotificationManager.success(json.message);
        getRules();
        getRoles();
        setShowDelete(false)
      } else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error in deletung rules', error);
    }
  }

  // states to show modals
  const [showEdit, setShowEdit] = useState(false);
  const [showDefine, setShowDefine] = useState(false);
  const [showDeelet, setShowDelete] = useState(false);
  return (
    <div>
      <Modal
        show={showEdit} onHide={() => setShowEdit(false)}
      >
        <Modal.Header>
          <Modal.Title>Edit Rules</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          <form>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">Rules for :</label>
              <select
                className="form-select"
                id="role"
                name='role'
                value={defineRole}
                onChange={(e) => setDefineRole(e.target.value)}
              >
                <option value="">Select...</option>
                {roles.roles.map((role, roleKey) => {
                  return <option key={roleKey}>{role}</option>;
                })}
              </select>
            </div>
            {modalRules.map((val, key) => (
              <div className="mb-3" key={key}>
                <label htmlFor={`rule-${key}`} className="form-label">Rule {key + 1}</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id={`rule-${key}`}
                    value={val}
                    onChange={(e) => handleRuleChange(key, e.target.value)}
                  />
                  <button type="button" className="btn btn-danger" onClick={() => deleteRuleInput(key)}>Delete</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-success" onClick={addRuleInput} disabled={!modalRules[0]}>Add Rule</button>
          </form>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => {
            setLoading(false); resetModalState(); setShowEdit(false);
          }}>Close</button>
          <button type="button" className="btn btn-warning" onClick={() => getRole(defineRole)} disabled={!defineRole}>Get Rules</button>
          <button type="button" className="btn" style={{ background: "maroon", color: "white" }} onClick={(e) => editRule(e)} disabled={!modalRules || !check}>Edit Rules</button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeelet} onHide={() => setShowDelete(false)}>
        <Modal.Header className="modal-header">
          <Modal.Title className="modal-title fs-5" id="exampleModalLabel">Delete Rules</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <form>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">Delete Rules for :</label>
              <select
                className="form-select"
                id="role"
                name='role'
                value={defineRole}
                onChange={(e) => setDefineRole(e.target.value)}
              >
                <option value="">Select...</option>
                {roles.roles.map((role, roleKey) => {
                  return <option key={roleKey}>{role}</option>;
                })}
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => {
            setLoading(false); resetModalState(); setShowDelete(false);
          }}>Close</button>
          <button type="button" className="btn" style={{ background: "maroon", color: "white" }} onClick={(e) => deleteRules(e)} disabled={!defineRole}>Delete Rules</button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDefine} onHide={() => { setShowDefine(false) }}>
        <Modal.Header>
          <Modal.Title>Define New Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="newRole" className="form-label">Rules For ....</label>
            <input
              type="text"
              className="form-control"
              id="newRole"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
          </div>
          {Array.from(newRules).map((rule, index) => (
            <div className="mb-3" key={index}>
              <label htmlFor={`newRule-${index}`} className="form-label">Rule {index + 1}</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id={`newRule-${index}`}
                  value={rule}
                  onChange={(e) => handleNewRuleChange(index, e.target.value)}
                />
                <button className="btn btn-danger" type="button" onClick={() => deleteNewRuleInput(index)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-success" disabled={!newRole} onClick={addNewRuleInput}>
            Add Rule
          </button>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            data-bs-dismiss="modal"
            onClick={() => {
              setNewRole('');
              setNewRules(['']);
              setShowDefine(false);
            }}
          >
            Close
          </button>
          <button
            type="button"
            className="btn" style={{ background: "maroon", color: "white" }}
            onClick={defineNewRole}
            disabled={!newRules[0] || !newRole}
          >
            Define Role
          </button>
        </Modal.Footer>
      </Modal>

      <div className='my-2 mx-4' style={{ border: "none" }}>
        {loading ? (
          <Loading />
        ) : (
          rules.roles.length > 0 ? (
            rules.roles.map((roleData, index) => {
              return (
                <div className="rules" key={index}>
                  <h3 style={{ fontWeight: "600", fontFamily: "'Libre Baskerville', sans-serif" }}>
                    {capitilize(roleData.role)}
                  </h3>
                  <ol style={{ paddingRight: "300px" }}>
                    {roleData.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex}>{rule}</li>
                    ))}
                  </ol>
                </div>
              );
            })
          ) : (
            <div>No rules defined yet.</div>
          )
        )}
      </div>

      {userData.member.isAdmin && <div className='d-grid gap-2 d-md-flex justify-content-md-end' style={{ position: "relative", right: "5.5rem", bottom: "2rem" }}>
        <button style={{ background: "maroon" }} type="button" className="btn btn-danger " onClick={() => {
          setShowEdit(true)
        }}>
          Edit Rules
        </button>
        <button style={{ background: "maroon" }} type="button" className="btn btn-danger " onClick={() => {
          setShowDefine(true)
        }}>
          Define Rules
        </button>
        <button style={{ background: "maroon" }} type="button" className="btn btn-danger " onClick={() => {
          setShowDelete(true)
        }}>
          Delete Rules
        </button>
      </div>}
      <NotificationContainer />
    </div>
  );
};

export default CumDashboard;