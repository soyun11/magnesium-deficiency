CREATE TABLE music (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,   -- 고유 식별자 (자동 증가)
    title VARCHAR(255) NOT NULL,            -- 곡 제목
    artist VARCHAR(255),                    -- 아티스트 명
    file_path VARCHAR(500) NOT NULL,        -- 파일 저장 경로
    bpm INT,                                -- 곡의 박자 (BPM)
    duration INT,                           -- 곡 길이 (초)
    difficulty INT,                         -- 난이도 (1, 2, 3...)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- 등록 일시 (자동 설정)
);