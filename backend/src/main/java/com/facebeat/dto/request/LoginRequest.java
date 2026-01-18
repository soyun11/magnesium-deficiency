package com.facebeat.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LoginRequest {
    private String userId;
    private String password;

    public String getUserId() { return userId; }
    public String getPassword() { return password; }
}