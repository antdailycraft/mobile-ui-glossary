/// <reference types="vitest/config" />
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

// Vite는 DNS 리바인딩 공격을 막기 위해 처음 보는 Host 헤더를 거부한다.
// 이 PC의 호스트 이름(metis)과 Tailscale MagicDNS 도메인(*.ts.net)으로 들어오는 접속만 추가로 허용한다.
// 앞에 점을 붙인 '.ts.net'은 그 하위 도메인 전체를 뜻한다.
const allowedHosts = ['metis', '.ts.net']

const CSS_ENTRY = fileURLToPath(new URL('./src/index.css', import.meta.url))

/**
 * 개발 서버가 켜진 상태에서 새 데모·콘텐츠 파일을 추가하면, Tailwind는 새 클래스를 만들지만
 * Vite가 index.css의 이전 변환 결과를 캐시해 두어 페이지에는 반영되지 않는 문제가 있다(새로고침해도 그대로).
 * 파일이 추가·삭제될 때 index.css 모듈을 무효화하고 전체 새로고침을 보내 이를 막는다.
 */
function refreshCssOnFileAdd(): Plugin {
  return {
    name: 'refresh-css-on-file-add',
    apply: 'serve',
    configureServer(server) {
      const onAddOrRemove = (file: string) => {
        if (!/\.(tsx?|mdx)$/.test(file)) return
        const graph = server.environments.client.moduleGraph
        for (const mod of graph.getModulesByFile(CSS_ENTRY) ?? []) graph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', onAddOrRemove)
      server.watcher.on('unlink', onAddOrRemove)
    },
  }
}

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
    refreshCssOnFileAdd(),
  ],
  // 같은 네트워크의 실제 휴대폰에서도 접속해 확인할 수 있도록 모든 인터페이스(0.0.0.0)에 바인딩한다.
  // 디버깅·개발용 포트는 다른 서비스와 겹치지 않게 20000 이상을 쓰고, 이미 사용 중이면 다른 포트로 넘어가지 않고 실패하게 한다.
  server: {
    host: '0.0.0.0',
    port: 20173,
    strictPort: true,
    allowedHosts,
  },
  preview: {
    host: '0.0.0.0',
    port: 20174,
    strictPort: true,
    allowedHosts,
  },
  test: {
    environment: 'node',
  },
})
