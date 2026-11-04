/// <reference types="vitest/config" />
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // MDX는 React 플러그인보다 먼저 JSX로 변환되어야 하므로 'pre'로 둔다.
    {
      enforce: 'pre',
      ...mdx({
        // frontmatter를 `export const frontmatter`로 노출해 lib/content.ts에서 읽는다.
        remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: 'frontmatter' }], remarkGfm],
      }),
    },
    react({ include: /\.(mdx|tsx?)$/ }),
    tailwindcss(),
  ],
  // 같은 네트워크의 실제 휴대폰에서도 접속해 확인할 수 있도록 모든 인터페이스(0.0.0.0)에 바인딩한다.
  // 디버깅·개발용 포트는 다른 서비스와 겹치지 않게 20000 이상을 쓰고, 이미 사용 중이면 다른 포트로 넘어가지 않고 실패하게 한다.
  server: {
    host: '0.0.0.0',
    port: 20173,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 20174,
    strictPort: true,
  },
  test: {
    environment: 'node',
  },
})
