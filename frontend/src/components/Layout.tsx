import React, { useEffect, useState } from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Collapse, Avatar } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import { jwtDecode } from 'jwt-decode';

const drawerWidth = 240;

interface LayoutProps {
    children: React.ReactNode;
    onViewChange: (view: string) => void;
    currentView: string;
}

export default function Layout({ children, onViewChange, currentView }: LayoutProps) {
    const [username, setUsername] = useState('User');
    const [email, setEmail] = useState('');
    const [openUserMenu, setOpenUserMenu] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                if (decoded.sub) {
                    setEmail(decoded.sub);
                    const namePart = decoded.sub.split('@')[0];
                    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                    setUsername(formattedName);
                }
            } catch (error) {
                console.error("Invalid token", error);
            }
        }
    }, []);

    const handleUserClick = () => {
        setOpenUserMenu(!openUserMenu);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        bgcolor: '#fafafa',
                        borderRight: '1px solid transparent'
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <ListItemButton onClick={handleUserClick} sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: '#d1453b' }}>
                                {username.charAt(0)}
                            </Avatar>
                        </ListItemIcon>
                        <ListItemText
                            primary={username}
                            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                        />
                        {openUserMenu ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />}
                    </ListItemButton>
                    <Collapse in={openUserMenu} timeout="auto" unmountOnExit>
                        <Box sx={{ pl: 7, pb: 1, pr: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', display: 'block', mb: 1 }}>
                                {email}
                            </Typography>
                            <ListItemButton
                                onClick={handleLogout}
                                sx={{
                                    pl: 0,
                                    py: 0.5,
                                    borderRadius: 1,
                                    color: '#d1453b',
                                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 24, color: 'inherit' }}>
                                    <LogoutIcon sx={{ fontSize: 16 }} />
                                </ListItemIcon>
                                <Typography variant="caption" fontWeight="bold">Sign out</Typography>
                            </ListItemButton>
                        </Box>
                    </Collapse>
                </Box>

                <List>
                    <ListItemButton selected={currentView === 'inbox'} onClick={() => onViewChange('inbox')}>
                        <ListItemIcon sx={{ minWidth: 40 }}><InboxIcon color={currentView === 'inbox' ? 'primary' : 'inherit'} /></ListItemIcon>
                        <ListItemText primary="Inbox" />
                    </ListItemButton>
                    <ListItemButton selected={currentView === 'today'} onClick={() => onViewChange('today')}>
                        <ListItemIcon sx={{ minWidth: 40 }}><TodayIcon color={currentView === 'today' ? 'success' : 'inherit'} /></ListItemIcon>
                        <ListItemText primary="Today" />
                    </ListItemButton>
                    <ListItemButton selected={currentView === 'upcoming'} onClick={() => onViewChange('upcoming')}>
                        <ListItemIcon sx={{ minWidth: 40 }}><CalendarMonthIcon color={currentView === 'upcoming' ? 'secondary' : 'inherit'} /></ListItemIcon>
                        <ListItemText primary="Upcoming" />
                    </ListItemButton>
                </List>

                <Divider sx={{ my: 1, mx: 2 }} />

                <Box sx={{ px: 3, py: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">MY PROJECTS</Typography>
                </Box>
                <List dense>
                    <ListItemButton>
                        <ListItemIcon sx={{ minWidth: 40, color: '#gray' }}>#</ListItemIcon>
                        <ListItemText primary="Personal" />
                    </ListItemButton>
                    <ListItemButton>
                        <ListItemIcon sx={{ minWidth: 40, color: '#gray' }}>#</ListItemIcon>
                        <ListItemText primary="Work" />
                    </ListItemButton>
                </List>

            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#ffffff', minHeight: '100vh' }}>
                {children}
            </Box>
        </Box>
    );
}
