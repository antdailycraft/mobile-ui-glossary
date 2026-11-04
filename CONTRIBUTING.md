# 기여 가이드

Mobile UI Glossary에 기여해 주셔서 감사합니다. 이 문서는 개발 환경, 커밋 규칙, 컴포넌트 추가 절차, 작성 규칙, PR과 릴리스 절차를 설명합니다.

## 목차

- [개발 환경 준비](#개발-환경-준비)
- [커밋 규칙](#커밋-규칙)
- [컴포넌트 추가 절차](#컴포넌트-추가-절차)
- [콘텐츠 작성 가이드](#콘텐츠-작성-가이드)
- [데모 작성 규칙](#데모-작성-규칙)
- [PR 체크리스트](#pr-체크리스트)
- [릴리스 절차](#릴리스-절차)

## 개발 환경 준비

```bash
npm install
npm run dev     # 개발 서버
npm test        # 단위 테스트와 콘텐츠 검증
npm run build   # 타입 검사, 테스트, 프로덕션 빌드
```

Node.js 20 이상이 필요합니다.

개발 서버는 `0.0.0.0:20173`, 미리보기 서버는 `0.0.0.0:20174`에 바인딩됩니다. 같은 Wi-Fi에 연결된 휴대폰에서 `http://<개발 PC의 IP>:20173`으로 접속하면 실제 터치로 데모를 확인할 수 있습니다. 포트가 이미 사용 중이면 다른 포트로 넘어가지 않고 오류로 멈춥니다(`strictPort`). 디버깅·개발용 포트는 20000 이상을 씁니다.

허용된 호스트 이름은 `localhost`, IP 주소, `metis`, Tailscale MagicDNS 도메인(`*.ts.net`)입니다. 예를 들어 `http://metis:20173`으로 접속할 수 있습니다. 다른 호스트 이름으로 접속하려면 `vite.config.ts`의 `allowedHosts`에 추가합니다. Vite는 DNS 리바인딩 공격을 막기 위해 목록에 없는 호스트를 403으로 거부합니다.

## 커밋 규칙

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/ko/v1.0.0/)을 따릅니다.

```
<type>(<scope>): <제목>

<본문: 변경 이유와 영향>
```

- `type`과 `scope`는 명세에 맞춰 영문으로 쓰고, 제목과 본문은 **한국어**로 씁니다.
- 제목은 50자 안팎으로 "~ 추가", "~ 수정" 형태로 쓰고 끝에 마침표를 찍지 않습니다.

| type | 용도 |
|---|---|
| `feat` | 새 컴포넌트, 새 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서·MDX 콘텐츠 수정 |
| `style` | 동작 변화가 없는 스타일·서식 변경 |
| `refactor` | 동작 변화가 없는 코드 구조 개선 |
| `test` | 테스트 추가·수정 |
| `chore` | 빌드 설정, 의존성 등 |

자주 쓰는 scope는 `content`, `demo`, `layout`, `lib`입니다.

```
feat(demo): Snackbar 실행 취소 동작 추가
docs(content): Kebab Menu 플랫폼별 차이 표 보완
```

**코드 주석도 한국어로 씁니다.** 식별자는 영문 그대로 둡니다. 주석에는 코드만 봐서는 알 수 없는 "왜"를 적습니다.

## 컴포넌트 추가 절차

새 컴포넌트는 **파일 2개만** 추가하면 됩니다. `src/lib/content.ts`와 `src/lib/demos.ts`가 `import.meta.glob`으로 파일을 자동으로 수집하므로 등록 코드는 고치지 않습니다.

1. **콘텐츠 파일 추가**: `src/content/components/<id>.mdx`
   - 파일명은 frontmatter의 `id`와 같아야 하며 kebab-case로 씁니다(예: `pull-to-refresh.mdx`).
2. **데모 파일 추가**: `src/demos/<Name>Demo.tsx`
   - 파일명은 반드시 `Demo.tsx`로 끝나야 하며, frontmatter의 `demo` 값과 같아야 합니다(확장자 제외).
   - 데모 컴포넌트를 `export default`로 내보냅니다.
3. **검증 실행**: `npm test`
   - frontmatter 형식, `id`와 파일명 일치, `related`에 적은 id의 존재 여부, 데모 파일의 존재 여부를 검사합니다.
   - 개발 서버에서도 같은 오류가 화면 위쪽에 빨간 상자로 표시됩니다.
4. **CHANGELOG 갱신**: `CHANGELOG.md`의 `## [Unreleased]` → `### 추가됨 (Added)`에 한 줄을 추가합니다.

## 콘텐츠 작성 가이드

### frontmatter 스키마

```yaml
---
id: kebab-menu                 # kebab-case, 파일명과 같음. URL 해시로 쓰임 (/#kebab-menu)
name: Kebab Menu               # 영문 기본 표기
aliases: [Overflow Menu, more_vert, 더보기 메뉴]   # 다른 이름. 검색 대상이 됨
category: navigation           # overlay | navigation | component | interaction
platforms: [material, web]     # material | ios | web 중 해당하는 것
summary: 한 줄 정의입니다.        # 헤더에 강조해서 표시됨. 한 문장으로 작성
related: [meatball-menu]       # 관련 컴포넌트 id. 존재하는 id만 쓸 수 있음
demo: KebabMenuDemo            # src/demos/KebabMenuDemo.tsx
---
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | 예 | kebab-case. 파일명과 같아야 합니다. |
| `name` | string | 예 | 컴포넌트 영문 이름 |
| `aliases` | string[] | 예 | 다른 이름. 없으면 `[]` |
| `category` | enum | 예 | `overlay`(오버레이), `navigation`(내비게이션), `component`(컴포넌트), `interaction`(인터랙션·상태) |
| `platforms` | enum[] | 예 | `material`, `ios`, `web` |
| `summary` | string | 예 | 한 줄 정의 |
| `related` | string[] | 예 | 관련 컴포넌트 id. 없으면 `[]` |
| `demo` | string | 예 | 데모 파일 이름(확장자 제외) |

### 본문 섹션

본문에는 아래 4개 섹션을 **이 순서와 이 제목 그대로** 둡니다. "사용하면 좋은 경우"와 "사용하지 말아야 할 경우" 제목에는 화면에서 아이콘이 자동으로 붙습니다.

```mdx
## 정의
## 사용하면 좋은 경우
## 사용하지 말아야 할 경우
## 플랫폼별 차이
```

- **플랫폼별 차이**는 `| 항목 | Material Design 3 | iOS HIG |` 형식의 표를 기본으로 하고, 필요하면 표 아래에 보충 설명을 씁니다.
- 한 플랫폼에 해당 컴포넌트가 없으면 "해당 컴포넌트 없음"이라고 쓰고, 그 플랫폼에서 대신 쓰는 방법을 설명합니다.

### 문체와 표기

- 본문은 한국어 **합니다체**로 씁니다.
- 컴포넌트 이름은 영문 표기를 기본으로 합니다(예: Bottom Sheet). 처음 나올 때 필요하면 한국어 이름을 함께 씁니다.
- 아이콘 이름, API 이름, 값은 `` `more_vert` ``처럼 코드 서식으로 씁니다.
- 공식 가이드라인 문장을 그대로 옮기지 말고 직접 풀어 씁니다.

## 데모 작성 규칙

### 구조

- 데모는 휴대폰 화면 컨테이너(`PhoneFrame`) 안에 그려집니다. 오버레이(시트, 스크림, 스낵바)는 `fixed`가 아니라 **`absolute`**로 배치해야 화면 밖으로 새어 나가지 않습니다.
- 가짜 앱 화면은 `demos/_shared/DemoScreen.tsx`를 씁니다. 앱 바와 "방금 일어난 동작"을 알려 주는 상태 줄(`status`)이 함께 들어 있습니다.
- **초기화는 직접 구현하지 않습니다.** `DemoHost`가 `key`를 바꿔 데모를 다시 마운트합니다. 데모의 초기 상태는 `useState` 초깃값으로만 정의합니다.
- 무거운 UI 라이브러리를 쓰지 않습니다. 동작 원리가 코드에 드러나도록 직접 구현합니다.

### 공용 코드

| 위치 | 용도 |
|---|---|
| `src/demos/_shared/useDrag.ts` | 포인터 이벤트 기반 드래그(거리·속도). 드래그 요소에는 `touch-none`을 함께 지정합니다. |
| `src/demos/_shared/Scrim.tsx` | 모달 뒤를 덮는 32% 스크림 |
| `src/demos/_shared/DemoScreen.tsx` | 가짜 앱 화면(앱 바 + 상태 줄) |
| `src/demos/_shared/ui.ts` | M3 버튼 클래스(filled, tonal, text) |
| `src/lib/useFocusTrap.ts` | 모달 포커스 트랩, Esc 처리, 닫을 때 포커스 복귀 |
| `src/lib/useReducedMotion.ts` | JS 애니메이션에서 동작 줄이기 설정 확인 |
| `src/components/IconButton.tsx` | `aria-label`이 필수인 48px 아이콘 버튼 |

`_shared/` 폴더는 데모 자동 등록 대상에서 빠집니다.

### 접근성 체크리스트

- [ ] 아이콘만 있는 버튼에는 `IconButton`을 쓰거나 `aria-label`을 지정했습니다.
- [ ] 모달(시트, 다이얼로그, 드로어)은 `role="dialog"`, `aria-modal`, 포커스 트랩, Esc 닫기를 갖추었고, 닫으면 포커스가 트리거로 돌아갑니다.
- [ ] 메뉴·목록은 화살표 키로 이동할 수 있습니다.
- [ ] 드래그나 스와이프로만 할 수 있는 동작에는 버튼 같은 대체 수단이 있습니다.
- [ ] 터치 영역이 최소 44×44px입니다(`min-h-11`, `size-12` 등).
- [ ] 전환은 CSS `transition`으로 처리해 `prefers-reduced-motion`이 자동으로 적용됩니다. JS 애니메이션이라면 `useReducedMotion`을 확인합니다.
- [ ] 자동으로 사라지는 요소는 마우스를 올리거나 포커스가 들어오면 타이머를 멈춥니다.
- [ ] 색은 hex 대신 M3 색 역할 클래스(`bg-surface-container`, `text-on-surface-variant` 등)를 써서 다크 테마에서도 맞게 보입니다.

## PR 체크리스트

- [ ] `npm run build`가 통과합니다(타입 검사, 테스트, 빌드).
- [ ] 모바일 너비(360px 안팎)와 데스크톱 너비에서 직접 확인했습니다.
- [ ] 라이트·다크 테마 모두에서 확인했습니다.
- [ ] 키보드만으로 데모를 조작해 보았습니다.
- [ ] `CHANGELOG.md`의 `[Unreleased]`를 갱신했습니다.
- [ ] 화면이 바뀌는 변경이라면 스크린숏을 첨부했습니다.

## 릴리스 절차

버전은 [유의적 버전 2.0.0](https://semver.org/lang/ko/)을 따르고, 변경 이력은 [Keep a Changelog 1.1.0](https://keepachangelog.com/ko/1.1.0/) 형식으로 관리합니다.

1. `CHANGELOG.md`의 `## [Unreleased]` 내용을 새 버전 제목(`## [0.2.0] - YYYY-MM-DD`) 아래로 옮기고, 빈 `[Unreleased]` 섹션을 남겨 둡니다.
2. `package.json`의 `version`을 같은 버전으로 올립니다.
3. `chore(release): v0.2.0` 메시지로 커밋하고, `v0.2.0` 태그를 붙입니다.
4. `CHANGELOG.md` 맨 아래의 비교 링크를 갱신합니다. `[Unreleased]`의 비교 기준을 새 태그로 바꾸고, 새 버전의 링크를 한 줄 추가합니다.

   ```
   [Unreleased]: https://github.com/antdailycraft/mobile-ui-glossary/compare/v0.2.0...HEAD
   [0.2.0]: https://github.com/antdailycraft/mobile-ui-glossary/compare/v0.1.0...v0.2.0
   ```

5. `git push`로 `main`을, `git push origin v0.2.0`으로 태그를 올립니다.

변경 유형 제목은 다음 중에서 씁니다: `추가됨 (Added)`, `변경됨 (Changed)`, `폐기 예정 (Deprecated)`, `제거됨 (Removed)`, `수정됨 (Fixed)`, `보안 (Security)`.
