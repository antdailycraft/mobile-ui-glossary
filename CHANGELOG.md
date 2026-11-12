# 변경 이력

이 프로젝트의 주요 변경 사항을 이 파일에 기록합니다.

형식은 [Keep a Changelog 1.1.0](https://keepachangelog.com/ko/1.1.0/)을 따르고,
버전 규칙은 [유의적 버전 2.0.0](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### 추가됨 (Added)

- Chevron Down(⌄, 꺾인 선) 항목과 데모: 아코디언, 더 보기, 화면 이동(›)과의 비교
- Caret Down(▼, 채워진 삼각형) 항목과 데모: 드롭다운 메뉴, 표 머리글 정렬 방향
- GitHub Pages 배포: https://antdailycraft.github.io/mobile-ui-glossary/ (`main` push와 수동 실행 시 배포)
- README와 아이콘 소스에 Material Icons 출처와 라이선스(Apache 2.0) 표기

## [0.3.1] - 2026-11-04

### 추가됨 (Added)

- 포커스 트랩, 드래그 훅, Action Sheet 데모의 상호작용 테스트(jsdom, Testing Library)
- GitHub Actions CI: push와 PR마다 타입 검사, 테스트, 빌드 실행
- GitHub Pages 배포 workflow (저장소 변수 `PAGES_ENABLED`가 `true`일 때 `main` push마다 배포)

### 변경됨 (Changed)

- 목록의 카테고리 제목을 한국어와 영문으로 함께 표기(예: 오버레이 · OVERLAY)하고 항목 개수를 붙여, 누를 수 있는 항목과 구분되게 함
- 본문 위쪽의 카테고리 표시도 한국어와 영문을 함께 표기
- Segmented Control, Navigation Drawer 문서의 Material 3 Expressive 설명을 공식 문서 기준으로 확정 (Segmented button과 Navigation drawer는 폐기 예정이며, 각각 연결형 버튼 그룹과 펼친 Navigation rail로 대체)

### 수정됨 (Fixed)

- Action Sheet 데모에서 바깥(스크림)을 누르면 닫히던 동작을 iPhone의 실제 동작에 맞춰 "취소" 버튼과 Esc 키로만 닫히도록 수정하고, 문서에 iPhone·iPad 차이를 추가

## [0.3.0] - 2026-11-04

### 추가됨 (Added)

- 데스크톱 레이아웃(1024px 이상): 앱 제목, 테마 전환, 검색, 카테고리별 목록이 있는 260px 사이드바를 항상 표시
- 키보드 사용자를 위한 "본문으로 건너뛰기" 버튼

### 변경됨 (Changed)

- 검색창과 목록을 `NavPanel`로 분리해 모바일 드로어와 데스크톱 사이드바가 함께 사용
- 사이드바에서는 항목을 고른 뒤에도 검색어를 유지해 검색 결과를 차례로 훑어볼 수 있음
- 다크 테마에서 휴대폰 프레임 테두리를 어두운 색으로 표시

## [0.2.0] - 2026-11-04

### 추가됨 (Added)

- 컴포넌트 21종의 설명과 실동작 데모
  - 오버레이: Standard Bottom Sheet, Scrim, Dialog, Action Sheet, Toast, Tooltip, Coach Mark
  - 내비게이션: Top App Bar, Bottom Navigation, Navigation Drawer, Hamburger Menu, Meatball Menu, Segmented Control
  - 컴포넌트: FAB, Chip, Badge, Card
  - 인터랙션·상태: Swipe Action, Pull-to-Refresh, Skeleton Screen, Empty State
- 데모용 공용 아이콘 23종
- 개발·미리보기 서버에서 호스트 이름 `metis`와 Tailscale MagicDNS 도메인(`*.ts.net`) 접속 허용

### 변경됨 (Changed)

- Modal Bottom Sheet, Snackbar, Kebab Menu의 관련 컴포넌트 링크를 새 컴포넌트와 연결

### 수정됨 (Fixed)

- 모달 안의 포커스할 수 없는 영역(제목, 여백, 스크림)을 누르면 포커스가 모달 밖으로 빠져 Esc와 Tab 가두기가 동작하지 않던 문제
- 개발 서버 실행 중에 새 파일을 추가하면 그 파일의 Tailwind 클래스가 페이지에 반영되지 않던 문제

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

[Unreleased]: https://github.com/antdailycraft/mobile-ui-glossary/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/antdailycraft/mobile-ui-glossary/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/antdailycraft/mobile-ui-glossary/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/antdailycraft/mobile-ui-glossary/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/antdailycraft/mobile-ui-glossary/releases/tag/v0.1.0
