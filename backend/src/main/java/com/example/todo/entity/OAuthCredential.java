package com.example.todo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "oauth_credentials", uniqueConstraints = @UniqueConstraint(columnNames = { "provider", "provider_id" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuthCredential {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false, name = "provider_id")
    private String providerId;

    private String email;
    private String name;
}
