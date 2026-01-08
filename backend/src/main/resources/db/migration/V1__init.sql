-- V1__init.sql 최종본
CREATE TABLE member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,  -- 중복 방지
    password VARCHAR(100) NOT NULL,        -- 필수 입력 (암호화 대비 100자)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);