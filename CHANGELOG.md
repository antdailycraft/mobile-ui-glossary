# 변경 이력

이 프로젝트의 주요 변경 사항을 이 파일에 기록합니다.

형식은 [Keep a Changelog 1.1.0](https://keepachangelog.com/ko/1.1.0/)을 따르고,
버전 규칙은 [유의적 버전 2.0.0](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

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
