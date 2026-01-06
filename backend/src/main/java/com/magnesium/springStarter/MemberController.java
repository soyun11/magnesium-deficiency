package com.magnesium.springStarter;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class MemberController {
    @GetMapping("/api/test")
    public Map<String, String> testConnection() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "성공");
        response.put("message", "백엔드 서버와 연결되었습니다!");
        return response;
    }
}