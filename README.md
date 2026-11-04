# Mobile UI Glossary

모바일 UI/UX 컴포넌트를 **실제로 동작하는 데모**로 익히는 인터랙티브 용어 사전입니다.

## 목차

- [배경](#배경)
- [주요 기능](#주요-기능)
- [설치](#설치)
- [사용법](#사용법)
- [프로젝트 구조](#프로젝트-구조)
- [컴포넌트 추가하기](#컴포넌트-추가하기)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

## 배경

"바텀 시트", "스낵바", "케밥 메뉴"처럼 기획·디자인·개발 사이에서 자주 오가는 용어는 이름이 플랫폼마다 다르고,
비슷한 요소끼리(Snackbar와 Toast, Kebab과 Meatball) 헷갈리기 쉽습니다.
이 사전은 각 용어의 정의, 사용하면 좋은 경우와 피해야 할 경우, Material과 iOS HIG의 차이를 정리합니다.
여기에 정적 이미지 대신 **직접 눌러 보고 끌어 볼 수 있는 데모**를 함께 제공합니다.

데모는 UI 라이브러리 없이 React로 직접 구현했습니다. 드래그해서 닫기, 포커스 트랩, 자동으로 사라지는 타이머 같은 동작 원리를 코드에서 그대로 확인할 수 있습니다.

## 주요 기능

- **실동작 데모**: 모든 컴포넌트에 직접 조작할 수 있는 데모와 "초기화" 버튼을 제공합니다.
- **검색**: 영문 이름, 다른 이름(`more_vert`, `Overflow Menu`), 한국어 이름(`더보기 메뉴`)으로 찾을 수 있습니다.
- **공유 가능한 주소**: 선택한 컴포넌트가 URL 해시(`/#kebab-menu`)에 반영됩니다.
- **반응형 Material Design 3 레이아웃**: 1024px 이상에서는 검색과 목록이 있는 사이드바(260px)를 항상 표시합니다. 그보다 좁으면 Top App Bar의 햄버거 버튼으로 내비게이션 드로어를 엽니다. 768px 이상에서는 데모를 360×720 휴대폰 프레임에 담고, 더 좁으면 프레임 없이 본문 너비를 꽉 채웁니다.
- **라이트/다크 테마**: 기본값은 시스템 설정을 따릅니다.
- **접근성**: 키보드 탐색, 모달 포커스 트랩, 아이콘 버튼 `aria-label`, `prefers-reduced-motion`을 지원하고, 터치 영역은 최소 44px입니다.

### 수록 컴포넌트 (24종)

| 카테고리 | 컴포넌트 |
|---|---|
| 오버레이 | Modal Bottom Sheet, Standard Bottom Sheet, Scrim, Dialog, Action Sheet, Snackbar, Toast, Tooltip, Coach Mark |
| 내비게이션 | Top App Bar, Bottom Navigation, Navigation Drawer, Hamburger Menu, Kebab Menu, Meatball Menu, Segmented Control |
| 컴포넌트 | FAB, Chip, Badge, Card |
| 인터랙션·상태 | Swipe Action, Pull-to-Refresh, Skeleton Screen, Empty State |

## 설치

Node.js 20 이상이 필요합니다.

```bash
git clone <저장소 주소>
cd mobile-ui-glossary
npm install
```

## 사용법

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버를 실행합니다. 주소는 http://localhost:20173 이며, 같은 네트워크의 기기에서는 `http://<내 IP>:20173`으로 접속합니다. |
| `npm run build` | 타입 검사, 콘텐츠 검증 테스트, 프로덕션 빌드를 차례로 실행합니다. 결과물은 `dist/`에 생성됩니다. |
| `npm run preview` | 빌드 결과물을 확인합니다. 주소는 http://localhost:20174 입니다. |
| `npm test` | 단위 테스트, 상호작용 테스트(jsdom), 콘텐츠 검증을 실행합니다. |
| `npm run typecheck` | 타입 검사만 실행합니다. |

### 지속적 통합과 배포

GitHub Actions(`.github/workflows/ci.yml`)가 모든 push와 PR에서 `npm run build`(타입 검사, 테스트, 빌드)를 실행합니다.

`main`에 push하면 빌드 결과를 GitHub Pages에 배포할 수 있습니다. 배포는 다음 두 가지가 갖춰졌을 때만 실행됩니다.

1. 저장소 **Settings → Pages**에서 Source를 **GitHub Actions**로 지정합니다. 무료 요금제에서는 공개 저장소만 Pages를 쓸 수 있습니다.
2. 저장소 **Settings → Secrets and variables → Actions → Variables**에 `PAGES_ENABLED` 변수를 `true`로 추가합니다.

배포 주소는 `https://<소유자>.github.io/mobile-ui-glossary/`입니다. 해시 라우팅을 쓰므로 Pages에서도 `/#snackbar` 같은 주소가 그대로 동작합니다.

## 프로젝트 구조

```
.github/workflows/ci.yml    # CI(타입 검사·테스트·빌드)와 GitHub Pages 배포
src/
├── App.tsx                 # 해시 라우팅과 화면 골격
├── index.css               # Material 3 디자인 토큰, 테마, 동작 줄이기 설정
├── components/
│   ├── Icon.tsx, IconButton.tsx
│   ├── layout/             # Sidebar(데스크톱), TopAppBar·NavDrawer(모바일), NavPanel, ComponentNav,
│   │                       # SearchField, ContentPanel, DemoHost, PhoneFrame, ThemeToggle
│   └── mdx/                # MDX 본문 스타일 매핑
├── content/components/     # 컴포넌트별 .mdx 파일 (설명 콘텐츠)
├── demos/                  # 컴포넌트별 데모 파일 (*Demo.tsx)
│   └── _shared/            # 데모 공용 코드 (드래그 훅, 스크림, 가짜 앱 화면 등)
└── lib/                    # 콘텐츠 로딩·검증, 검색, 데모 레지스트리, 공용 훅
```

## 컴포넌트 추가하기

파일 **2개만** 추가하면 됩니다. 등록 코드는 고칠 필요가 없습니다.

1. `src/content/components/<id>.mdx`: frontmatter와 본문 4개 섹션
2. `src/demos/<Name>Demo.tsx`: 기본 내보내기(default export)를 하는 데모 컴포넌트

자세한 절차, frontmatter 스키마, 작성 규칙은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

## 기여하기

이슈와 PR을 환영합니다. 커밋 규칙, 콘텐츠 작성 가이드, PR 체크리스트는 [CONTRIBUTING.md](./CONTRIBUTING.md)에 정리되어 있습니다.
변경 이력은 [CHANGELOG.md](./CHANGELOG.md)에서 확인할 수 있습니다.

## 라이선스

[MIT](./LICENSE) © 2026 Suha Park
