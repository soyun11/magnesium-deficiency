-- 더미 데이터 삽입 (테스트 유저 10명)
-- 비밀번호는 모두 '1234' 입니다. (BCrypt로 암호화된 값: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)
-- username과 user_id를 동일하게 설정했습니다.

INSERT INTO member (username, user_id, password) VALUES 
('testuser1',  'testuser1',  '$2a$12$DYCjarPyLFmt7hBj3sGg.Okj8Fpa6BSrmR6HPc1ViBNOrIfekxKGC'),
('testuser2',  'testuser2',  '$2a$12$DYCjarPyLFmt7hBj3sGg.Okj8Fpa6BSrmR6HPc1ViBNOrIfekxKGC'),
('testuser3',  'testuser3',  '$2a$12$DYCjarPyLFmt7hBj3sGg.Okj8Fpa6BSrmR6HPc1ViBNOrIfekxKGC'),
('testuser4',  'testuser4',  '$2a$12$DYCjarPyLFmt7hBj3sGg.Okj8Fpa6BSrmR6HPc1ViBNOrIfekxKGC'),
('testuser5',  'testuser5',  '$2a$12$DYCjarPyLFmt7hBj3sGg.Okj8Fpa6BSrmR6HPc1ViBNOrIfekxKGC'),
('testuser6',  'testuser6',  '$2a$12$DYCjarPyLFmt7hBj3sGg.Okj8Fpa6BSrmR6HPc1ViBNOrIfekxKGC'),
('testuser7',  'testuser7',  '$2a$12$DYCjarPyLFmt7hBj3sGg.Okj8Fpa6BSrmR6HPc1ViBNOrIfekxKGC'),
('testuser8',  'testuser8',  '$2a$12$DYCjarPyLFmt7hBj3sGg.Okj8Fpa6BSrmR6HPc1ViBNOrIfekxKGC'),
('testuser9',  'testuser9',  '$2a$12$DYCjarPyLFmt7hBj3sGg.Okj8Fpa6BSrmR6HPc1ViBNOrIfekxKGC'),
('testuser10', 'testuser10', '$2a$12$DYCjarPyLFmt7hBj3sGg.Okj8Fpa6BSrmR6HPc1ViBNOrIfekxKGC');