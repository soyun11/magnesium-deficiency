-- 1. user_id 컬럼을 추가합니다. (기존 데이터가 있을 수 있으므로 일단 NULL 허용)
ALTER TABLE member ADD COLUMN user_id VARCHAR(50);

-- 2. 기존 데이터가 있다면, username 값을 user_id로 복사해서 채워줍니다.
-- (나중에 실행될 때 데이터가 있어도 에러가 나지 않게 해줍니다)
UPDATE member SET user_id = username WHERE user_id IS NULL;

-- 3. 모든 칸이 채워졌으므로 NOT NULL과 UNIQUE(중복금지) 제약조건을 겁니다.
ALTER TABLE member MODIFY COLUMN user_id VARCHAR(50) NOT NULL UNIQUE;