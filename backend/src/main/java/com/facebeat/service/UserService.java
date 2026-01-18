package com.facebeat.service;

import com.facebeat.dto.request.LoginRequest; // 로그인 요청 DTO (아이디, 비번)
import com.facebeat.dto.request.SignupRequest; // 회원가입 요청 DTO (아이디, 비번)
import com.facebeat.entity.User;
import com.facebeat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder; // 이거 임포트!
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // ▼ [핵심] 암호화 기계 주입받기

    // 1. 회원가입 (암호화해서 저장)
    @Transactional
    public void signup(SignupRequest request) {
        // 중복 체크 등 로직 생략...

        // ▼ [핵심 1] 비밀번호를 암호화(Encoding) 한다!
        // 입력: "1234" -> 출력: "$2a$10$DkLx..."
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 암호화된 비밀번호로 유저 생성
        User user = new User(request.getUsername(), encodedPassword);
        
        userRepository.save(user);
    }

    // 2. 로그인 (암호화된 것과 비교)
    @Transactional(readOnly = true)
    public void login(LoginRequest request) {
        // 1. 아이디로 유저 찾기 (없으면 에러)
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("없는 아이디입니다."));

        // 2. ▼ [핵심 2] 비밀번호 비교 (Matching)
        // passwordEncoder.matches(입력한_쌩_비번, DB에_있는_암호화_비번)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 틀렸습니다!");
        }

        // 통과하면 로그인 성공! (나중엔 여기서 토큰 발급 등을 함)
    }
}