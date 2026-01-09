import { useState } from 'react';
import { Box, Button, TextField, MenuItem, Paper } from '@mui/material';
import api from '../api/api';
import AddIcon from '@mui/icons-material/Add';

interface TaskFormProps {
    onTaskCreated: () => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('NORMAL');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tasks', {
                description,
                priority,
                status: 'NOT_STARTED',
                deadline: deadline ? new Date(deadline).toISOString() : null
            });
            setDescription('');
            setPriority('NORMAL');
            setDeadline('');
            setIsExpanded(false);
            onTaskCreated();
        } catch (err) {
            console.error('Failed to create task', err);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            {!isExpanded ? (
                <Button
                    startIcon={<AddIcon sx={{ color: '#d1453b' }} />}
                    onClick={() => setIsExpanded(true)}
                    sx={{
                        color: 'text.secondary',
                        textTransform: 'none',
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        '&:hover': { color: '#d1453b', bgcolor: 'transparent' },
                        pl: 0
                    }}
                >
                    Add task
                </Button>
            ) : (
                <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mt: 1 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            placeholder="Task name"
                            variant="standard"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            autoFocus
                            InputProps={{ disableUnderline: true, style: { fontWeight: 500 } }}
                            sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                type="datetime-local"
                                variant="outlined"
                                size="small"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                sx={{ width: 200 }}
                            />

                            <TextField
                                select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                size="small"
                                variant="outlined"
                                sx={{ width: 120 }}
                            >
                                <MenuItem value="URGENT" sx={{ color: '#d1453b' }}>Urgent</MenuItem>
                                <MenuItem value="NORMAL" sx={{ color: '#eb8909' }}>Normal</MenuItem>
                                <MenuItem value="LOW" sx={{ color: 'text.secondary' }}>Low</MenuItem>
                            </TextField>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={() => setIsExpanded(false)} color="inherit" sx={{ textTransform: 'none', color: '#555' }}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!description}
                                sx={{
                                    bgcolor: '#d1453b',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#b03a32', boxShadow: 'none' }
                                }}
                            >
                                Add Task
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}
