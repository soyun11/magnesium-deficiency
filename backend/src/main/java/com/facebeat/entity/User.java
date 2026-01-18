package com.facebeat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "member")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ [신규 추가] 로그인용 아이디 (DB 컬럼: user_id)
    @Column(name = "user_id", unique = true, nullable = false, length = 50)
    private String userId;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime created_at;

    public User() {}

    // 회원가입 등을 위해 모든 정보를 받는 생성자
    public User(String userId, String username, String password) {
        this.userId = userId;     // 로그인 ID
        this.username = username; // 사용자 이름
        this.password = password; // 비밀번호
    }

    public Long getId() { return id; }
    public String getUserId() { return userId; }   // ✅ 추가됨
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public LocalDateTime getCreated_at() { return created_at; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; } // ✅ 추가됨
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
}
