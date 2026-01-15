package com.facebeat.dto.response;

public class UserResponse {
    private Long id;
    private String username;

    public UserResponse() {}
    public UserResponse(Long id, String username) {
        this.id = id;
        this.username = username;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
}
