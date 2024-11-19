import React, { useState } from 'react'
import { useEffect } from 'react';
import Loading from '../Loading';
import { NotificationContainer } from 'react-notifications';
import {server} from '../server'

const ExtensionRequests = () => {
    const [data, setData] = useState({ member: [] });
    const [loading, setLoading] = useState(false);
    const getDetail = async () => {
        try {
            const response = await fetch(`${server}/supervisor/detail`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            const json = await response.json();
            setData(json);
            console.log('json is in extension request', json);
        } catch (error) {
            console.log('error in getting supervisor data ', error);
        }
    }
    useEffect(() => {
        if (localStorage.getItem("token")) {
            setLoading(true);
            setTimeout(() => {
                getDetail();
                setLoading(false);
            }, 1000)
        }
    }, [])

    const handleRequest = async (id, action) => {
        try {
            const response = await fetch(`${server}/supervisor/extension/${id}/${action}`, {
                method: "POST",
                headers: {
                    "Authorization": localStorage.getItem('token')
                }
            });
            const json = await response.json();
            console.log('json is ', json);
            alert(json.message);
            getDetail();
        } catch (error) {
            console.log('error in json ', error);
        }
    }
    return (
        <div>
            {!loading ? (
                <>
                    {data.member.extensionRequest && data.member.extensionRequest
                        .length > 0 ? (
                        <div className="container my-5">
                            <h3 className='text-center'>Extension Requests</h3>
                            <div>
                                <div>
                                    <table className='table table-hover text-center'>
                                        <thead style={{ textAlign: "center" }}>
                                            <tr>
                                                <th scope="col">Sr No.</th>
                                                <th scope="col">Group</th>
                                                <th scope="col">Reason</th>
                                                <th scope="col">Accept</th>
                                                <th scope="col">Reject</th>
                                            </tr>
                                        </thead>
                                        <tbody className='text-center'>
                                            {data.member.extensionRequest.map((group, groupKey) => (
                                                <tr key={groupKey}>
                                                    <td>{groupKey + 1}</td>
                                                    <td>{group.group}</td>
                                                    <td>{group.reason}</td>
                                                    <td><button className="btn btn-sm" style={{ background: "maroon", color: "white" }} onClick={() => {
                                                        handleRequest(group.requestId, "accept")
                                                    }}>Accept</button></td>
                                                    <td><button className="btn btn-sm" style={{ background: "maroon", color: "white" }} onClick={() => {
                                                        handleRequest(group.requestId, "reject")
                                                    }}>Reject</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <h2 className='text-center' style={{ position: "absolute", transform: "translate(-50%,-50%", left: "50%", top: "50%" }}>No Extension Reuests for now.</h2>
                    )}
                    <NotificationContainer />
                </>
            ) : <Loading />}
        </div>
    )
}

export default ExtensionRequests