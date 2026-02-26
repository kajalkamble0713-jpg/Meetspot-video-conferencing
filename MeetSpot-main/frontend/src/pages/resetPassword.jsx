import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockResetIcon from '@mui/icons-material/LockReset';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import server from '../environment';
import { Alert, CircularProgress } from '@mui/material';

const defaultTheme = createTheme();

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [passwordError, setPasswordError] = React.useState('');

    React.useEffect(() => {
        if (!token) {
            setError('Invalid reset link');
        }
    }, [token]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setPasswordError('');

        // Validation
        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Password strength validation
        const pwOk = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(newPassword);
        if (!pwOk) {
            setPasswordError('Password must be at least 8 characters, include at least one uppercase letter, one number, and one special character.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${server}/api/v1/users/reset-password`, {
                token: token,
                newPassword: newPassword
            });

            setSuccess(response.data.message);
            setNewPassword('');
            setConfirmPassword('');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/auth');
            }, 2000);

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

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://source.unsplash.com/random?security)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockResetIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Reset Password
                        </Typography>

                        {success && (
                            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                                {success}
                            </Alert>
                        )}

                        {error && !token && (
                            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                                {error}
                            </Alert>
                        )}

                        {token && (
                            <Box component="form" onSubmit={handleResetPassword} noValidate sx={{ mt: 1, width: '100%' }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="newPassword"
                                    label="New Password"
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    error={!!passwordError}
                                    helperText={passwordError || 'Min 8 chars, 1 uppercase, 1 number, 1 special character'}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />

                                {error && (
                                    <Typography color="error" sx={{ mt: 1 }}>
                                        {error}
                                    </Typography>
                                )}

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                                </Button>

                                <Button
                                    fullWidth
                                    variant="text"
                                    onClick={() => navigate('/auth')}
                                >
                                    Back to Login
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
