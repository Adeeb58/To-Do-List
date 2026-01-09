import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Divider, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [identifier, setIdentifier] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleEmailAuth = async () => {
        try {
            if (isLogin) {
                const res = await api.post('/auth/login', { identifier, password });
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard');
            } else {
                await api.post('/auth/signup', { username, email, password });
                alert('Signup successful! Please login.');
                setIsLogin(true);
            }
        } catch (err: any) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleOAuth = (provider: string) => {
        const CLIENT_ID = provider === 'google'
            ? import.meta.env.VITE_GOOGLE_CLIENT_ID
            : import.meta.env.VITE_GITHUB_CLIENT_ID;

        const REDIRECT_URI = 'http://localhost:5173/callback';
        const AUTH_URL = provider === 'google'
            ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile&state=${provider}`
            : `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email&state=${provider}`;

        window.location.href = AUTH_URL;
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            p: 2
        }}>
            <Paper elevation={0} sx={{
                p: 5,
                width: '100%',
                maxWidth: 420,
                borderRadius: 4,
                boxShadow: '0 8px 40px rgba(0,0,0,0.08)'
            }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{
                        display: 'inline-flex',
                        p: 1.5,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        mb: 2
                    }}>
                        <AssignmentTurnedInOutlinedIcon fontSize="large" />
                    </Box>
                    <Typography variant="h4" fontWeight="700" color="text.primary">
                        {isLogin ? '' : 'Create account'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {isLogin ? 'Enter your details to access your tasks.' : 'Start organizing your life today.'}
                    </Typography>
                </Box>

                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {isLogin ? (
                        <TextField
                            label="Username or Email"
                            variant="outlined"
                            fullWidth
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    ) : (
                        <>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                variant="outlined"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </>
                    )}

                    <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleEmailAuth}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: 'none',
                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                        }}
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </Button>
                </Box>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <Box
                            component="span"
                            onClick={() => setIsLogin(!isLogin)}
                            sx={{
                                color: 'primary.main',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </Box>
                    </Typography>
                </Box>

                <Divider sx={{ my: 4 }}>
                    <Typography variant="caption" color="text.secondary">OR CONTINUE WITH</Typography>
                </Divider>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<GoogleIcon />}
                        onClick={() => handleOAuth('google')}
                        sx={{
                            py: 1.2,
                            borderRadius: 2,
                            borderColor: '#e0e0e0',
                            color: 'text.primary',
                            textTransform: 'none',
                            '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
                        }}
                    >
                        Google
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<GitHubIcon />}
                        onClick={() => handleOAuth('github')}
                        sx={{
                            py: 1.2,
                            borderRadius: 2,
                            borderColor: '#e0e0e0',
                            color: 'text.primary',
                            textTransform: 'none',
                            '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
                        }}
                    >
                        GitHub
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
