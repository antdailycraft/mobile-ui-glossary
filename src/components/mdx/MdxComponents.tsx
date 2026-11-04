import type { MDXComponents } from 'mdx/types'
import { Children, isValidElement, type ReactNode } from 'react'
import { Icon } from '../Icon'

const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((n) => (typeof n === 'string' ? n : isValidElement<{ children?: ReactNode }>(n) ? textOf(n.props.children) : ''))
    .join('')

/*
 * 본문 섹션 제목은 CONTRIBUTING.md에서 고정해 두었으므로, 제목 글자로 권장/비권장 섹션을 알아보고 아이콘을 붙인다.
 * MDX 작성자가 별도 컴포넌트를 import하지 않아도 일관된 모양이 나오게 하기 위해서다.
 */
function H2({ children }: { children?: ReactNode }) {
  const text = textOf(children)
  const tone = text.includes('사용하지 말아야') ? 'dont' : text.includes('사용하면 좋은') ? 'do' : null
  return (
    <h2 className="mb-3 mt-10 flex items-center gap-2 text-title-lg text-on-surface">
      {tone === 'do' && <Icon name="check" className="size-6 text-primary" />}
      {tone === 'dont' && <Icon name="close" className="size-6 text-error" />}
      {children}
    </h2>
  )
}

export const mdxComponents: MDXComponents = {
  h2: H2,
  h3: (p) => <h3 className="mb-2 mt-6 text-title-md" {...p} />,
  p: (p) => <p className="my-3 text-body-lg text-on-surface" {...p} />,
  ul: (p) => <ul className="my-3 list-disc space-y-2 pl-6 text-body-lg marker:text-on-surface-variant" {...p} />,
  ol: (p) => <ol className="my-3 list-decimal space-y-2 pl-6 text-body-lg" {...p} />,
  strong: (p) => <strong className="font-medium text-on-surface" {...p} />,
  a: (p) => <a className="text-primary underline underline-offset-2" {...p} />,
  code: (p) => <code className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.9em]" {...p} />,
  table: (p) => (
    // 표가 화면보다 넓으면 표 자체만 가로로 스크롤되게 해서 페이지 전체가 가로로 밀리지 않게 한다.
    <div className="my-4 overflow-x-auto rounded-xl border border-outline-variant">
      <table className="w-full min-w-[480px] border-collapse text-left text-body-md" {...p} />
    </div>
  ),
  th: (p) => <th className="border-b border-outline-variant bg-surface-container px-3 py-2.5 font-medium" {...p} />,
  td: (p) => <td className="border-b border-outline-variant px-3 py-2.5 align-top last:border-b-0" {...p} />,
}
