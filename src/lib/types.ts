import type { MDXProps } from 'mdx/types'
import type { JSX } from 'react'

export const CATEGORIES = ['overlay', 'navigation', 'component', 'interaction'] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  overlay: '오버레이',
  navigation: '내비게이션',
  component: '컴포넌트',
  interaction: '인터랙션·상태',
}

export const PLATFORMS = ['material', 'ios', 'web'] as const
export type Platform = (typeof PLATFORMS)[number]

export const PLATFORM_LABELS: Record<Platform, string> = {
  material: 'Material',
  ios: 'iOS HIG',
  web: 'Web',
}

/** MDX frontmatter 스키마. 필드 설명은 CONTRIBUTING.md에도 같은 내용으로 정리되어 있다. */
export interface ComponentMeta {
  id: string
  name: string
  aliases: string[]
  category: Category
  platforms: Platform[]
  summary: string
  related: string[]
  demo: string
}

export interface ComponentEntry extends ComponentMeta {
  Body: (props: MDXProps) => JSX.Element
}
