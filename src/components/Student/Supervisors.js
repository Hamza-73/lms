import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import {server} from '../server'

const Supervisors = (props) => {
  const history = useNavigate();

  const [data, setData] = useState({ members: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);


  const getMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await axios.get(`${server}/supervisor/get-supervisors`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = response.data;
      console.log('supervisors are ', json); // Log the response data to see its structure
      setData(json);
    } catch (error) {
      NotificationManager.error('Error in fetching Supervisors');
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      history('/');
    } else {
      // Set loading to true when starting data fetch
      setLoading(true);
      getMembers()
        .then(() => {
          // Once data is fetched, set loading to false
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false); // Handle error cases
          console.error('Error fetching data:', error);
        });
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = data.members.filter((member) =>
    member.name.toLowerCase().trim().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().trim().includes(searchQuery.toLowerCase()) ||
    member.designation.toLowerCase().trim().includes(searchQuery.toLowerCase())
  );

    const paginate = (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  };

  const filteredDataPaginated = paginate(filteredData, recordsPerPage, currentPage);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / recordsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };


  return (
    <>
      {loading ? (<Loading />) : (
        <>
          <div className='container' style={{ width: "90%" }}>
            <h3 className='text-center'>Supervisor List</h3>
            <div className="mb-3">
              <label htmlFor="recordsPerPage" className="form-label">Records per page:</label>
              <select id="recordsPerPage" className="form-select" value={recordsPerPage} onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, department, or designation"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            {filteredDataPaginated.length > 0 ? (
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Username</th>
                    <th scope="col">Department</th>
                    <th scope="col">Designation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDataPaginated.map((val, key) => (
                    <tr key={key}>
                      <td>{val.name}</td>
                      <td>{val.username}</td>
                      <td>{val.department}</td>
                      <td>{val.designation}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>No matching members found.</div>
            )}
            <div className="d-flex justify-content-between">
              <button type="button" className="btn btn-success" disabled={currentPage === 1} onClick={handlePrevPage}
              >  Previous </button>
              <button type="button" className="btn btn-success" disabled={currentPage === Math.ceil(filteredData.length / recordsPerPage)} onClick={handleNextPage}
              >  Next </button>
            </div>
          </div>
          <NotificationContainer />
        </>
      )}
    </>
  )
}

export default Supervisors;