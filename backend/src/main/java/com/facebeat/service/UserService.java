package com.facebeat.service;

import com.facebeat.dto.request.SignupRequest;
import com.facebeat.entity.User;
import com.facebeat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ✨ [추가됨] 0. 아이디 중복 확인 (Controller에서 사용)
    @Transactional(readOnly = true)
    public boolean checkIdDuplicate(String userId) {
        // 아이디로 조회했을 때 존재하면 true, 없으면 false 반환
        return userRepository.findByUserId(userId).isPresent();
    }

    // 1. 회원가입
    @Transactional
    public void signup(SignupRequest request) {
        // 중복 체크 (혹시 몰라 한 번 더 안전장치)
        if (userRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // User 엔티티 생성 및 저장
        User user = new User(request.getUserId(), request.getUsername(), encodedPassword);
        userRepository.save(user);
    }

    // 2. 로그인
    @Transactional(readOnly = true)
    public User login(String userId, String password) {
        // 1. 아이디로 찾기
        User user = userRepository.findByUserId(userId)
                .orElse(null);

        // 2. 비밀번호 검증 (DB의 암호화된 비번과 비교)
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }

        return null; // 로그인 실패
    }
}