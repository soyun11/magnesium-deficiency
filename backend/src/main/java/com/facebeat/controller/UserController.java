package com.facebeat.controller;

import com.facebeat.dto.request.LoginRequest;
import com.facebeat.dto.request.SignupRequest;
import com.facebeat.entity.User;
import com.facebeat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users") // ✅ 기본 주소: http://localhost:8080/api/users
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 1. 아이디 중복 확인 (GET /api/users/check-id?userId=test)
    @GetMapping("/check-id")
    public ResponseEntity<?> checkId(@RequestParam String userId) {
        // 방금 UserService에 추가한 함수를 여기서 사용합니다!
        boolean isDuplicate = userService.checkIdDuplicate(userId);

        if (isDuplicate) {
            // 409 Conflict: 이미 있어서 충돌남
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 존재하는 아이디입니다.");
        } else {
            // 200 OK: 사용 가능
            return ResponseEntity.ok("사용 가능한 아이디입니다.");
        }
    }

    // 2. 회원가입 (POST /api/users/signup)
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        try {
            userService.signup(signupRequest);
            return ResponseEntity.ok("회원가입 성공!");
        } catch (IllegalArgumentException e) {
            // UserService에서 "이미 존재하는 아이디입니다"라고 에러를 던지면 여기서 잡아서 보여줌
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. 로그인 (POST /api/users/login)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // UserService의 login 기능 호출
        User user = userService.login(loginRequest.getUserId(), loginRequest.getPassword());

        if (user != null) {
            // 로그인 성공 시: 프론트엔드에 넘겨줄 정보 포장
            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getUserId());
            response.put("userName", user.getUsername());
            response.put("message", "로그인 성공");
            
            return ResponseEntity.ok(response);
        } else {
            // 로그인 실패 시: 401 Unauthorized 에러 반환
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    }
}