import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function CallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const called = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const provider = state || 'google';

        if (code && !called.current) {
            called.current = true;
            api.post('/auth/oauth2/callback', {
                code,
                provider,
                redirectUri: 'http://localhost:5173/callback'
            })
                .then(res => {
                    localStorage.setItem('token', res.data.token);
                    navigate('/dashboard');
                })
                .catch(err => {
                    console.error(err);
                    alert('Login failed: ' + (err.response?.data?.message || err.message));
                    navigate('/login');
                });
        }
    }, [searchParams, navigate]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Authenticating...</Typography>
        </Box>
    );
}
