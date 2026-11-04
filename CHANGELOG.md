# 변경 이력

이 프로젝트의 주요 변경 사항을 이 파일에 기록합니다.

형식은 [Keep a Changelog 1.1.0](https://keepachangelog.com/ko/1.1.0/)을 따르고,
버전 규칙은 [유의적 버전 2.0.0](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [0.1.0] - 2026-11-04

### 추가됨 (Added)

- Vite + React + TypeScript(strict) + Tailwind CSS 4 기반 프로젝트 구성
- Material Design 3 색 역할·타입 스케일·모션 토큰과 라이트/다크 테마(기본값은 시스템 설정)
- 모바일 레이아웃: Top App Bar(햄버거 버튼, 선택한 컴포넌트 이름, 테마 전환)
- 모달 내비게이션 드로어: 컴포넌트 검색(영문 이름·별칭·한국어), 카테고리별 목록, 키보드 탐색, 포커스 트랩
- URL 해시(`/#modal-bottom-sheet`)로 선택 상태를 표시해 링크 공유와 뒤로 가기 지원
- MDX 콘텐츠 자동 수집과 frontmatter·참조 검증(빌드할 때 테스트로 실행)
- 데모 자동 등록과 "초기화" 버튼
- 컴포넌트 3종의 설명과 실동작 데모: Modal Bottom Sheet, Snackbar, Kebab Menu
- README, CONTRIBUTING, MIT 라이선스
- 개발 서버를 `0.0.0.0:20173`, 미리보기 서버를 `0.0.0.0:20174`에 바인딩해 같은 네트워크의 기기에서 접속 가능
