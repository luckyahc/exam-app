/**
 * 데이터과학 SQL 문제의 준비 스크립트(스키마 + 초기 데이터). sql.js(SQLite)에서 실행된다.
 * 근거: source/data-science/Lec5.pdf s.43~47 [코드 5-2]~[코드 5-5]. MySQL 전용 문법만 SQLite에 맞게 바꿨다
 * (ds-source-analysis.md §5-3): `#` 주석 → `--`, `VALUES(…, DEFAULT, …)` → 열 목록을 적고 그 열을 빼서 기본값 사용,
 * `CREATE DATABASE`·`USE`는 뺌(SQLite는 데이터베이스 = 파일 하나).
 */
export const FIRST_DB_SETUP = `
CREATE TABLE 학생
(학번 CHAR(2) PRIMARY KEY,
이름 VARCHAR(20) NOT NULL,
주소 VARCHAR(50) NOT NULL UNIQUE,
전화번호 CHAR(13) NOT NULL DEFAULT '해당사항 없음',
생년월일 DATE NULL);

CREATE TABLE 과목
(과목번호 CHAR(2) PRIMARY KEY,
과목명 VARCHAR(20) NOT NULL,
강의실 VARCHAR(2) NOT NULL,
시간수 INT NOT NULL);

CREATE TABLE 수강
(학번 CHAR(2) NOT NULL,
과목번호 CHAR(2) NOT NULL,
학점 CHAR(1) NULL,
PRIMARY KEY(학번, 과목번호),
FOREIGN KEY(학번) REFERENCES 학생(학번),
FOREIGN KEY(과목번호) REFERENCES 과목(과목번호));

-- 학생 테이블 데이터 입력하기
INSERT INTO 학생 VALUES('s1', '홍길동', '경기 파주', '010-1111-1111', '2001-01-15');
INSERT INTO 학생 VALUES('s2', '강감찬', '전북 전주','010-2222-2222', '2002-12-25');
INSERT INTO 학생 VALUES('s3', '을지문덕', '서울 강남', '010-3333-3333', '2000-05-05');
INSERT INTO 학생 VALUES('s4', '이순신', '대전 유성', '010-4444-4444', '2002-07-17');
INSERT INTO 학생(학번, 이름, 주소, 생년월일) VALUES('s5', '김유신', '강원도 원주', NULL);

-- 과목 테이블 데이터 입력하기
INSERT INTO 과목 VALUES('c1', '인공지능개론', 'r1', 3);
INSERT INTO 과목 VALUES('c2', '웃음치료', 'r2', 2);
INSERT INTO 과목 VALUES('c3', '경영학', 'r3', 3);
INSERT INTO 과목 VALUES('c4', '3D 디자인', 'r4', 4);

-- 수강 테이블 데이터 입력하기
INSERT INTO 수강 VALUES('s1', 'c1', 'A');
INSERT INTO 수강 VALUES('s1', 'c2', 'A');
INSERT INTO 수강 VALUES('s2', 'c2', 'B');
INSERT INTO 수강 VALUES('s2', 'c3', 'D');
INSERT INTO 수강 VALUES('s4', 'c1', 'C');
INSERT INTO 수강 VALUES('s4', 'c3', 'A');
INSERT INTO 수강 VALUES('s5', 'c1', 'B');
`;

/** 학생·과목 테이블과 데이터만 — 수강 테이블을 만드는 [코드 5-4] 문제용(Sprint 16) */
export const STUDENT_COURSE_SETUP = FIRST_DB_SETUP.replace(/CREATE TABLE 수강[\s\S]*?\);\n/, "").replace(/-- 수강 테이블 데이터 입력하기[\s\S]*$/, "");

/** 준비 스크립트 이름 → 내용(문제 데이터에는 이름만 적는다). empty: 테이블을 처음 만드는 [코드 5-2]·[코드 5-3] 문제용 */
export const SQL_SETUPS = { firstDB: FIRST_DB_SETUP, studentCourse: STUDENT_COURSE_SETUP, empty: "" } as const;
export type SqlSetupName = keyof typeof SQL_SETUPS;
