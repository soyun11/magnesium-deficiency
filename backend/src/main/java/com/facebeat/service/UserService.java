package com.facebeat.service;

import com.facebeat.dto.request.SignupRequest; // (회원가입용 DTO 필요 시)
import com.facebeat.entity.User;
import com.facebeat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor // final 붙은 필드만 생성자 자동 생성 (Autowired 대체)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // 암호화 기계

    // 1. 회원가입 (비밀번호 암호화 후 저장)
    @Transactional
    public void signup(SignupRequest request) {
        // 이미 있는 ID인지 확인
        if (userRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // 비밀번호 암호화 ("1234" -> "$2a$10$Of...")
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // User 객체 생성 (아이디, 이름, 암호화된비번)
        User user = new User(request.getUserId(), request.getUsername(), encodedPassword);
        
        userRepository.save(user);
    }

    // 2. 로그인 (암호화된 비번 비교 & User 객체 반환)
    @Transactional(readOnly = true)
    public User login(String userId, String password) {
        // 1. 아이디(userId)로 찾기
        User user = userRepository.findByUserId(userId)
                .orElse(null); // 없으면 null

        // 2. 유저가 있고 + 비밀번호가 맞는지(matches) 확인
        // matches(입력받은_쌩_비번, DB의_암호화_비번)
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user; // 성공 시 유저 정보 반환 (Controller가 써야 하니까!)
        }

        // 실패 시 null 반환
        return null;
    }
}