import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import ForgotPasswordDialog from './forgotPassword';



// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();
export default function Authentication() {

   

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [linkedin, setLinkedin] = React.useState("");
    const [designation, setDesignation] = React.useState("");

    // Live validation flags/messages
    const [passwordError, setPasswordError] = React.useState("");
    const [emailError, setEmailError] = React.useState("");
    const [linkedinError, setLinkedinError] = React.useState("");

    const isValidLinkedIn = (value) => {
        if (!value || value.trim() === "") return true; // optional
        const v = value.trim();
        const allowed = [
            "linkedin.com/in/",
            "www.linkedin.com/in/",
            "https://linkedin.com/in/",
            "https://www.linkedin.com/in/",
        ];
        return allowed.some((p) => v.startsWith(p) && v.length > p.length);
    };


    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false);
    const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);


    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        // Clear previous error
        setError("");
        
        // Validation
        if (!username || !password || (formState === 1 && !email)) {
            setError("Please fill in all fields");
            return;
        }
        
        if (formState === 1 && !name) {
            setError("Please fill in all fields");
            return;
        }

        // local validation for better UX
        if (formState === 1) {
            const pwOk = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
            const emOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
            setPasswordError(pwOk ? "" : "Min 8 chars, 1 uppercase, 1 number, 1 special character.");
            setEmailError(emOk ? "" : "Email must contain @ and a valid domain.");
            if (!pwOk || !emOk) return;
        }
        
        try {
            if (formState === 0) {
                let result = await handleLogin(username, password);
            }
            if (formState === 1) {
                if (!isValidLinkedIn(linkedin)) {
                    setLinkedinError("Please enter a valid LinkedIn profile URL or else leave blank its optional");
                    setError("");
                    return;
                }
                let result = await handleRegister(name, username, password, email, linkedin, designation);
                console.log(result);
                setUsername("");
                setName("");
                setEmail("");
                setLinkedin("");
                setDesignation("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
                setPasswordError(""); setEmailError(""); setLinkedinError("");
            }
        } catch (err) {
            console.log(err);
            let message = "An error occurred";
            
            // Safely extract error message
            if (err.response && err.response.data && err.response.data.message) {
                message = err.response.data.message;
            } else if (err.message) {
                message = err.message;
            }

            // If LinkedIn invalid, clear only linkedin field and keep others
            if (/LinkedIn profile link/.test(message)) {
                setLinkedin("");
                setLinkedinError("Enter a valid LinkedIn profile URL or leave empty (it's optional).");
                setFormState(1);
            }
            
            setError(message);
        }
    }


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
                        backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
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
                            <LockOutlinedIcon />
                        </Avatar>


                        <div>
                            <Button variant={formState === 0 ? "contained" : ""} onClick={() => { setFormState(0) }}>
                                Sign In
                            </Button>
                            <Button variant={formState === 1 ? "contained" : ""} onClick={() => { setFormState(1) }}>
                                Sign Up
                            </Button>
                        </div>

                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            {formState === 1 ? <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Full Name"
                                name="username"
                                value={name}
                                autoFocus
                                onChange={(e) => setName(e.target.value)}
                            /> : <></>}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus
                                onChange={(e) => setUsername(e.target.value)}

                            />
                            {formState === 1 ? <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                                error={!!emailError}
                                helperText={emailError || ""}
                            /> : <></>}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                                error={!!passwordError}
                                helperText={passwordError || "Min 8 chars, 1 uppercase, 1 number, 1 special character."}
                                id="password"
                            />
                            {formState === 1 ? <>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="linkedin"
                                    label="LinkedIn Profile URL (optional)"
                                    name="linkedin"
                                    value={linkedin}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setLinkedin(val);
                                        if (!val || val.trim() === "") {
                                            setLinkedinError("");
                                        } else if (!isValidLinkedIn(val)) {
                                            setLinkedinError("Please enter a valid LinkedIn profile URL or else leave blank its optional");
                                        } else {
                                            setLinkedinError("");
                                        }
                                    }}
                                    error={!!linkedinError}
                                    helperText={linkedinError || ""}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="designation"
                                    label="Designation (optional)"
                                    name="designation"
                                    value={designation}
                                    onChange={(e) => setDesignation(e.target.value)}
                                />
                            </> : <></>}

                            <p style={{ color: "red" }}>{error}</p>

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login " : "Register"}
                            </Button>

                            {formState === 0 && (
                                <Grid container justifyContent="flex-end">
                                    <Grid item>
                                        <Link
                                            component="button"
                                            variant="body2"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setForgotPasswordOpen(true);
                                            }}
                                        >
                                            Forgot password?
                                        </Link>
                                    </Grid>
                                </Grid>
                            )}

                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
            />

            <ForgotPasswordDialog 
                open={forgotPasswordOpen} 
                onClose={() => setForgotPasswordOpen(false)} 
            />

        </ThemeProvider>
    );
}
