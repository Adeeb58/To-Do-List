package com.example.todo.dto;

import com.example.todo.entity.Priority;
import com.example.todo.entity.Status;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskRequest {
    @NotBlank
    private String description;

    private Priority priority;

    private Status status;

    @Future(message = "Deadline must be in the future")
    private LocalDateTime deadline;
}
