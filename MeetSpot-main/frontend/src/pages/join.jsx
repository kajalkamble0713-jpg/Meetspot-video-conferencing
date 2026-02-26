import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import axios from 'axios';
import server from '../environment';
import { useNavigate } from 'react-router-dom';

export default function JoinPage() {
  const [meetingId, setMeetingId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!meetingId || !password) {
      alert('Enter meeting id and password');
      return;
    }
    try {
      const res = await axios.post(`${server}/api/v1/meetings/join`, { meetingId, password });
      if (res.status === 200 && res.data?.ok) {
        sessionStorage.setItem(`meetingPassword:${meetingId}`, password);
        navigate(`/${meetingId}`);
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Join failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <TextField label="Meeting ID" value={meetingId} onChange={e => setMeetingId(e.target.value)} />
        <TextField label="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button variant="contained" onClick={handleJoin}>Join</Button>
      </div>
    </div>
  );
}
