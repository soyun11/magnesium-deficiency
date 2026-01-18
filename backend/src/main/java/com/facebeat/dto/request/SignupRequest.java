package com.facebeat.dto.request;

import lombok.Getter; 
import lombok.NoArgsConstructor;

@Getter 
@NoArgsConstructor
public class SignupRequest {
    private String username;
    private String password;
}