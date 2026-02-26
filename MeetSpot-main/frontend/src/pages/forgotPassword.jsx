import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import server from '../environment';

export default function ForgotPasswordDialog({ open, onClose }) {
    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!username || !email) {
            setError('Please enter both username and email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${server}/api/v1/users/forgot-password`, {
                username: username,
                email: email
            });

            setSuccess(`Password reset email sent to ${response.data.email}`);
            setUsername('');
            setEmail('');

            // Close dialog after 3 seconds
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 3000);

        } catch (err) {
            let message = 'An error occurred';
            if (err.response && err.response.data && err.response.data.message) {
                message = err.response.data.message;
            } else if (err.message) {
                message = err.message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setUsername('');
        setEmail('');
        setError('');
        setSuccess('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Enter your username and registered email address. We'll send you a password reset link if both match our records.
                </DialogContentText>

                {success && (
                    <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                        {success}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    autoFocus
                    margin="dense"
                    id="username"
                    label="Username"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    sx={{ mt: 2 }}
                />
                
                <TextField
                    margin="dense"
                    id="email"
                    label="Registered Email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
