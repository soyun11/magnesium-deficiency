package com.facebeat.dto.request; // 1. 패키지는 무조건 맨 위로!

// import lombok... (롬복을 안 쓰고 직접 메서드를 만드셨으니 import도 필요 없습니다)

public class SignupRequest {

    // 1. 로그인 ID
    private String userId; 
    
    // 2. 사용자 이름
    private String username; 
    
    // 3. 비밀번호
    private String password;

    // 기본 생성자
    public SignupRequest() {}

    // ==========================
    // Getter 메서드들
    // ==========================

    public String getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
}