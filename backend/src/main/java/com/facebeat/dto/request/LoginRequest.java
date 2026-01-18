package com.facebeat.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LoginRequest {
    private String user_id;
    private String password;

    public String getUserId() { return user_id; }
    public String getPassword() { return password; }
}