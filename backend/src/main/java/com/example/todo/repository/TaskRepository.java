package com.example.todo.repository;

import com.example.todo.entity.Priority;
import com.example.todo.entity.Status;
import com.example.todo.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    Page<Task> findByOwnerId(Long userId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.owner.id = :userId " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (cast(:deadlineFrom as timestamp) IS NULL OR t.deadline >= :deadlineFrom) " +
            "AND (cast(:deadlineTo as timestamp) IS NULL OR t.deadline <= :deadlineTo)")
    Page<Task> findFiltered(@Param("userId") Long userId,
            @Param("priority") Priority priority,
            @Param("status") Status status,
            @Param("deadlineFrom") java.time.LocalDateTime deadlineFrom,
            @Param("deadlineTo") java.time.LocalDateTime deadlineTo,
            Pageable pageable);
}
