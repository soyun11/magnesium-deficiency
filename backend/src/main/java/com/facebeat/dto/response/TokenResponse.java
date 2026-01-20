package com.facebeat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor; // 혹시 필요할 수 있음
import lombok.Setter; // 혹시 필요할 수 있음

@Getter
@AllArgsConstructor
public class TokenResponse {
    private Long id;
    private String token;

    public TokenResponse() {}
    public TokenResponse(String token) { this.token = token; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
