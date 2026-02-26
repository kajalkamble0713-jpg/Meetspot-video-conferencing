import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import server from '../environment';

function HomeComponent() {


    let navigate = useNavigate();
    const [joinMeetingId, setJoinMeetingId] = useState("");
    const [joinPassword, setJoinPassword] = useState("");
    const [createdMeeting, setCreatedMeeting] = useState(null); // { meetingId, password }
    const [dialogOpen, setDialogOpen] = useState(false);

    const {addToUserHistory} = useContext(AuthContext);

    const handleCreateMeeting = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to create a meeting.');
                navigate('/auth');
                return;
            }
            const res = await axios.post(`${server}/api/v1/meetings/create`, { token });
            const { meetingId, password } = res.data || {};
            if (meetingId && password) {
                sessionStorage.setItem(`meetingPassword:${meetingId}`, password);
                try { await addToUserHistory(meetingId); } catch(e) {}
                setCreatedMeeting({ meetingId, password });
                setDialogOpen(true);
            }
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || 'Failed to create meeting';
            alert(msg);
            if (e?.response?.status === 400 || e?.response?.status === 401) {
                navigate('/auth');
            }
        }
    }

    const handleJoinMeeting = async () => {
        try {
            if (!joinMeetingId || !joinPassword) {
                alert('Enter meeting id and password');
                return;
            }
            const res = await axios.post(`${server}/api/v1/meetings/join`, { meetingId: joinMeetingId, password: joinPassword });
            if (res.status === 200 && res.data?.ok) {
                sessionStorage.setItem(`meetingPassword:${joinMeetingId}`, joinPassword);
                try { await addToUserHistory(joinMeetingId); } catch(e) {}
                navigate(`/${joinMeetingId}`);
            }
        } catch (e) {
            alert(e?.response?.data?.message || 'Join failed');
        }
    }

    return (
        <>

            <div className="navBar">

                <div style={{ display: "flex", alignItems: "center" }}>

                    <h2>MeetSpot Video Call</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={
                        () => {
                            navigate("/history")
                        }
                    }>
                        <RestoreIcon />
                    </IconButton>
                    <p>History</p>

                    <Button onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>
                        Logout
                    </Button>
                </div>


            </div>


            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>

                        <div style={{ display: 'flex', gap: "10px", marginBottom: '16px' }}>
                            <Button variant='contained' onClick={handleCreateMeeting}>Create New Meeting</Button>
                        </div>

                        <div style={{ display: 'flex', gap: "10px" }}>
                            <TextField value={joinMeetingId} onChange={e => setJoinMeetingId(e.target.value)} id="join-id" label="Meeting ID" variant="outlined" />
                            <TextField value={joinPassword} onChange={e => setJoinPassword(e.target.value)} id="join-pass" label="Password" variant="outlined" />
                            <Button onClick={handleJoinMeeting} variant='contained'>Join</Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Meeting Created</DialogTitle>
                <DialogContent>
                    {createdMeeting ? (
                        <div style={{ minWidth: 320 }}>
                            <p><strong>Meeting ID:</strong> {createdMeeting.meetingId}</p>
                            <p><strong>Password:</strong> {createdMeeting.password}</p>
                            <Button
                                variant="outlined"
                                startIcon={<ContentCopyIcon />}
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(`Meeting ID: ${createdMeeting.meetingId}\nPassword: ${createdMeeting.password}`);
                                        alert('Meeting details copied to clipboard');
                                    } catch (e) {
                                        alert('Failed to copy');
                                    }
                                }}
                            >
                                Copy details
                            </Button>
                        </div>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                    <Button variant="contained" onClick={() => {
                        if (createdMeeting?.meetingId) {
                            navigate(`/${createdMeeting.meetingId}`);
                        }
                    }}>Enter meeting</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


export default withAuth(HomeComponent)
