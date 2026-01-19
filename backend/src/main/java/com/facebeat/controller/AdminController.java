package com.facebeat.controller;

import com.facebeat.dto.request.AdminLoginRequest;
import com.facebeat.entity.User;
import com.facebeat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // [필수 임포트]
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    
    // [수정 1] 비밀번호 암호화 비교를 위한 인코더 주입
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        
        // 디버깅용 로그는 이제 지우셔도 됩니다.
        
        // 1. 아이디로 유저 찾기 (String 아이디 기준)
        Optional<User> userOptional = userRepository.findByUserId(request.getId());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // [수정 2] 단순 문자열 비교(.equals) 대신 matches() 사용
            // passwordEncoder.matches(입력받은비번, DB의암호화된비번)
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                
                // 추가 검증 (관리자 아이디인지 확인)
                if (!"admin123".equals(user.getUserId())) {
                     return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자 권한이 없습니다.");
                }

                // 로그인 성공 처리
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("role", "ADMIN");
                response.put("userId", user.getUserId());
                response.put("message", "관리자 로그인 성공");

                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("관리자 계정이 없거나 비밀번호가 틀립니다.");
    }
}