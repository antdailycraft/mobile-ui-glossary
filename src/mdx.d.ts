// MDX 모듈 타입 선언. remark-mdx-frontmatter가 frontmatter를 named export로 추가한다.
declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types'
  import type { JSX } from 'react'

  export const frontmatter: unknown
  export default function MDXContent(props: MDXProps): JSX.Element
}
