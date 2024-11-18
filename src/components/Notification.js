import React, { useEffect, useState } from 'react'
import Loading from './Loading';

const Notification = (props) => {
    const [notification, setNotification] = useState({ notification: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getNotification = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/${props.user}/notification`, {
                    method: "GET",
                    headers: {
                        "Authorization": token
                    }
                });
                const json = await response.json();
                console.log('notification is ', json);
                setNotification(json);
                setLoading(false);
            } catch (error) {
                // Handle error
            }
        }

        if (localStorage.getItem('token')) {
            setLoading(true);
            setTimeout(() => {
                getNotification();
                setLoading(false);
            }, 1000)
        }
    }, []);

    const seenNotification = async (index) => {
        try {
            const token = localStorage.getItem('token');
            console.log('notification is marked');
            const response = await fetch(`http://localhost:5000/${props.user}/mark-notification-seen/${index}`, {
                method: "POST",
                headers: {
                    "Authorization": token
                }
            });
            const json = await response.json();

            // Assuming you want to update the state after marking the notification as seen,
            // you can remove the notification from the array in the state.
            if (json.success) {
                const updatedNotifications = [...notification.notification];
                updatedNotifications.splice(index, 1);
                setNotification({ notification: updatedNotifications });
            }

        } catch (error) {
            // Handle error
        }
    }

    return (
        <>
            {!loading ? <>
                <div style={{ marginTop: "3%" }}>
                    {notification.notification.length > 0 ? notification.notification.slice().reverse().map((elm, index) => {
                        // Calculate the original index before reversing
                        const originalIndex = notification.notification.length - 1 - index;
                        return (
                            <div style={{ position: "relative", left: "50px" }} key={originalIndex}>
                                <div style={{ height: "60px", width: "90%" }} class={`alert alert-${elm.type === 'Important' || elm.type === 'important' ? 'danger' : 'primary'} alert-dismissible fade show`} role="alert">
                                    <strong style={{ border: `2px solid ${elm.type === 'Important' || elm.type === 'important' ? '#f6abb6' : "blue"}`, borderRadius: "6px", padding: "5px" }}>{elm.type}</strong>    {elm.message}
                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => { seenNotification(originalIndex) }}></button>
                                </div>
                            </div>
                        )
                    }) : <h2 className='text-center'>You currently have no New Messages</h2>}
                </div>
            </> : <Loading />}
        </>
    )
}

export default Notification;