package com.facebeat.dto.request;

public class RegisterRequest {
    private String userId;
    private String password;

    public RegisterRequest() {}

    public String getUsername() { return userId; }
    public String getPassword() { return password; }

    public void setUsername(String userId) { this.userId = userId; }
    public void setPassword(String password) { this.password = password; }
}
