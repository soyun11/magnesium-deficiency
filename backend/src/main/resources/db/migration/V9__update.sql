-- 1. 기존 scores 테이블의 외래키(숫자 id 연결) 삭제
-- (V5에서 제약조건 이름을 따로 지정하지 않았다면 기본값은 scores_ibfk_1 입니다)
-- 만약 에러가 난다면 'SHOW CREATE TABLE scores'로 제약조건 이름을 확인해야 합니다.
ALTER TABLE scores DROP FOREIGN KEY scores_ibfk_1;

-- 2. 데이터를 옮겨담을 임시 컬럼(문자열) 생성
ALTER TABLE scores ADD COLUMN temp_user_id VARCHAR(50);

-- 3. [데이터 이사] member 테이블과 조인해서, 숫자 ID에 맞는 문자열 ID(testuser1)를 찾아 임시 컬럼에 복사
-- (기존 데이터가 날아가지 않게 하는 핵심 단계)
UPDATE scores s
JOIN member m ON s.user_id = m.id
SET s.temp_user_id = m.user_id;

-- 4. 기존 숫자형 user_id 컬럼 삭제
ALTER TABLE scores DROP COLUMN user_id;

-- 5. 임시 컬럼(temp_user_id)의 이름을 user_id로 바꾸고 NOT NULL 설정
ALTER TABLE scores CHANGE COLUMN temp_user_id user_id VARCHAR(50) NOT NULL;

-- 6. 새로운 외래키 설정 (이제 member 테이블의 user_id 문자열 컬럼을 가리킴)
ALTER TABLE scores ADD CONSTRAINT fk_scores_member_string_id
FOREIGN KEY (user_id) REFERENCES member(user_id) ON DELETE CASCADE;