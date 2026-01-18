package com.facebeat.controller;
package com.facebeat.dto.request;

import com.facebeat.dto.LoginRequest;
import com.facebeat.entity.User;
import com.facebeat.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // DTO에서 받은 userId와 password를 서비스로 전달
        User user = userService.login(loginRequest.getUserId(), loginRequest.getPassword());

        if (user != null) {
            // 로그인 성공 시
            // React에서 userData.userId를 사용하므로, 응답 JSON의 키를 맞춰줍니다.
            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getUserId()); // DB의 username을 React의 userId로 매핑
            response.put("userName", user.getUsername()); // 예: "홍길동"
            response.put("message", "로그인 성공");
            
            return ResponseEntity.ok(response);
        } else {
            // 로그인 실패 시
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    }
}