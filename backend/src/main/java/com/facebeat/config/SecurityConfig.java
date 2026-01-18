package com.facebeat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity // 스프링 시큐리티 활성화
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CSRF 보안 끄기 (Rest API에서는 보통 끕니다)
            .csrf(AbstractHttpConfigurer::disable)
            
            // 2. 요청 주소별 권한 설정
            .authorizeHttpRequests(auth -> auth
                // "/api/users/**" 로 시작하는 주소(로그인, 회원가입)는 누구나 접속 가능!
                .requestMatchers("/api/users/**").permitAll()
                // 그 외 다른 요청도 일단은 다 허용 (개발 편의상)
                // 나중에 .anyRequest().authenticated()로 바꾸면 로그인한 사람만 가능해짐
                .anyRequest().permitAll()
            );

        return http.build();
    }

    // 아까 만든 비밀번호 암호화 기계
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}