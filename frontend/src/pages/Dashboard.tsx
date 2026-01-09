import { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import api from '../api/api';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import Layout from '../components/Layout';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [view, setView] = useState('inbox'); // inbox, today, upcoming

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks?sort=priority');
            setTasks(res.data.content);
        } catch (err: any) {
            console.error('Failed to fetch tasks', err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure?')) {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        }
    };

    const handleStatusChange = async (task: any, status: string) => {
        try {
            const payload = {
                description: task.description,
                priority: task.priority,
                deadline: task.deadline,
                status: status
            };
            await api.put(`/tasks/${task.id}`, payload);
            fetchTasks();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const filteredTasks = tasks.filter((t: any) => {
        if (view === 'inbox') return true;
        if (view === 'today') {
            if (!t.deadline) return false;
            const today = new Date().toISOString().split('T')[0];
            return t.deadline.startsWith(today);
        }
        if (view === 'upcoming') {
            return t.deadline && new Date(t.deadline) > new Date();
        }
        return true;
    });

    const getTitle = () => {
        switch (view) {
            case 'inbox': return 'Inbox';
            case 'today': return 'Today';
            case 'upcoming': return 'Upcoming';
            default: return 'Tasks';
        }
    }

    return (
        <Layout onViewChange={setView} currentView={view}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold">{getTitle()}</Typography>
                </Box>

                <TaskList tasks={filteredTasks} onDelete={handleDelete} onStatusChange={handleStatusChange} />

                <Box sx={{ mt: 4 }}>
                    <TaskForm onTaskCreated={fetchTasks} />
                </Box>
            </Box>
        </Layout>
    );
}
