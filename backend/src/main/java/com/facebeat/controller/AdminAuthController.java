package com.facebeat.controller;

import com.facebeat.dto.request.AdminLoginRequest; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        // 지정한 특정 관리자 정보
        String adminId = "admin123";
        String adminPw = "magnesium!@#";

        if (adminId.equals(request.getId()) && adminPw.equals(request.getPassword())) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "role", "ADMIN",
                "message", "관리자 인증 성공"
            ));
        } else {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "아이디 또는 비밀번호가 틀립니다."
            ));
        }
    }
}