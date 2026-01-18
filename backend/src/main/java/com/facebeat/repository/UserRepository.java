package com.facebeat.repository;

import com.facebeat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // ✅ 로그인용: user_id 컬럼으로 찾기
    Optional<User> findByUserId(String userId);

    // (참고) 만약 이름으로 찾을 일이 있다면 남겨둡니다 (로그인엔 안 씀)
    Optional<User> findByUsername(String username);
}