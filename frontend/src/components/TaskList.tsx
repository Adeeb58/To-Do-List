import { Box, Checkbox, IconButton, Typography, Chip } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';

interface Task {
    id: number;
    description: string;
    priority: string;
    status: string;
    deadline?: string;
}

interface TaskListProps {
    tasks: Task[];
    onDelete: (id: number) => void;
    onStatusChange?: (task: Task, status: string) => void;
}

export default function TaskList({ tasks, onDelete, onStatusChange }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 10, color: 'text.secondary' }}>
                <Typography>No tasks found.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            {tasks.map((task) => (
                <Box
                    key={task.id}
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        py: 1.5,
                        borderBottom: '1px solid #f0f0f0',
                        '&:hover .actions': { opacity: 1 }
                    }}
                >
                    <Checkbox
                        icon={<CircleOutlinedIcon sx={{ color: getPriorityColor(task.priority) }} />}
                        checkedIcon={<CheckCircleIcon sx={{ color: 'text.disabled' }} />}
                        checked={task.status === 'DONE'}
                        onChange={(e) => onStatusChange && onStatusChange(task, e.target.checked ? 'DONE' : 'NOT_STARTED')}
                        sx={{ p: 0, mr: 2, mt: 0.5 }}
                    />

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography
                            sx={{
                                textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                                color: task.status === 'DONE' ? 'text.disabled' : 'text.primary',
                                fontSize: '0.95rem'
                            }}
                        >
                            {task.description}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5, alignItems: 'center' }}>
                            {task.deadline && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isOverdue(task.deadline) ? 'error.main' : 'text.secondary' }}>
                                    <CalendarTodayIcon sx={{ fontSize: 12 }} />
                                    <Typography variant="caption">{format(new Date(task.deadline), 'MMM d')}</Typography>
                                </Box>
                            )}
                            <Chip
                                label={task.priority}
                                size="small"
                                variant="outlined"
                                sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    borderColor: 'transparent',
                                    color: 'text.secondary',
                                    bgcolor: '#f5f5f5'
                                }}
                            />
                        </Box>
                    </Box>

                    <Box className="actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                        <IconButton size="small" onClick={() => { }}><EditOutlinedIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => onDelete(task.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case 'URGENT': return '#d1453b';
        case 'NORMAL': return '#eb8909';
        default: return '#808080';
    }
}

function isOverdue(deadline: string) {
    return new Date(deadline) < new Date();
}
