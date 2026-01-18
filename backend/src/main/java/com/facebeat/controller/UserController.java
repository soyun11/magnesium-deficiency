package com.facebeat.controller;

import com.facebeat.dto.request.LoginRequest;
import com.facebeat.dto.request.SignupRequest; // 회원가입 DTO import
import com.facebeat.entity.User;
import com.facebeat.service.UserService;
import lombok.RequiredArgsConstructor; // 롬복 추가
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor // ✅ Autowired 대신 이걸 쓰면 더 안전하고 깔끔합니다.
public class UserController {

    private final UserService userService; // final을 붙여야 롬복이 인식함

    // 1. 회원가입 (POST /api/users/signup)
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        try {
            userService.signup(signupRequest);
            return ResponseEntity.ok("회원가입 성공!");
        } catch (IllegalArgumentException e) {
            // "이미 존재하는 아이디입니다" 같은 에러 메시지를 반환
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. 로그인 (POST /api/users/login)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.login(loginRequest.getUserId(), loginRequest.getPassword());

        if (user != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getUserId());
            response.put("userName", user.getUsername());
            response.put("message", "로그인 성공");
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    }
}