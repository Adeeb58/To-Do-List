package com.example.todo.service;

import com.example.todo.dto.TaskRequest;
import com.example.todo.dto.TaskResponse;
import com.example.todo.entity.Priority;
import com.example.todo.entity.Status;
import com.example.todo.entity.Task;
import com.example.todo.entity.User;
import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.repository.TaskRepository;
import com.example.todo.repository.UserRepository;
import com.example.todo.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public Page<TaskResponse> getTasks(UserPrincipal currentUser,
            Priority priority,
            Status status,
            LocalDateTime deadlineFrom,
            LocalDateTime deadlineTo,
            Pageable pageable) {
        return taskRepository.findFiltered(currentUser.getId(), priority, status, deadlineFrom, deadlineTo, pageable)
                .map(TaskResponse::fromEntity);
    }

    public TaskResponse createTask(UserPrincipal currentUser, TaskRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task task = Task.builder()
                .owner(user)
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.NORMAL)
                .status(request.getStatus() != null ? request.getStatus() : Status.NOT_STARTED)
                .deadline(request.getDeadline())
                .build();

        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    public TaskResponse getTask(UserPrincipal currentUser, Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied");
        }
        return TaskResponse.fromEntity(task);
    }

    public TaskResponse updateTask(UserPrincipal currentUser, Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        if (request.getDescription() != null)
            task.setDescription(request.getDescription());
        if (request.getPriority() != null)
            task.setPriority(request.getPriority());
        if (request.getStatus() != null)
            task.setStatus(request.getStatus());
        if (request.getDeadline() != null)
            task.setDeadline(request.getDeadline());

        // Check if deadline passed and adjust status if needed logic could be adding
        // scheduled task or check here
        // Simple logic: if updated status isn't DONE and Deadline Passed -> MISSED
        if (task.getDeadline() != null && task.getDeadline().isBefore(LocalDateTime.now())
                && task.getStatus() != Status.DONE) {
            task.setStatus(Status.MISSED_DEADLINE);
        }

        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    public void deleteTask(UserPrincipal currentUser, Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied");
        }
        taskRepository.delete(task);
    }
}
