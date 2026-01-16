CREATE TABLE scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,        -- member 테이블의 id를 참조
    song_id BIGINT NOT NULL,        -- music 테이블의 id를 참조
    score_value INT NOT NULL,       -- 점수
    combo INT DEFAULT 0,            -- 최대 콤보
    grade VARCHAR(10),              -- 등급 (S, A, B...)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- [핵심] 외래키 연결 (테이블 이름 정확히 매칭)
    FOREIGN KEY (user_id) REFERENCES member(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES music(id) ON DELETE CASCADE
);