package com.facebeat.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email; // 로그인 ID 역할

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String nickname;

    // Role 등 추가 가능
}