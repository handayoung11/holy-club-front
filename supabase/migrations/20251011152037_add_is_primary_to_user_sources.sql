/*
  # user_sources 테이블에 is_primary 컬럼 추가

  1. 변경사항
    - `user_sources` 테이블에 `is_primary` 컬럼 추가 (boolean, 기본값 false)
    - 기본 출처인지 여부를 나타냄
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sources' AND column_name = 'is_primary'
  ) THEN
    ALTER TABLE user_sources ADD COLUMN is_primary boolean DEFAULT false;
  END IF;
END $$;