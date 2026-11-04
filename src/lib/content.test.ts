import { describe, expect, it } from 'vitest'
import { components, contentErrors } from './content'
import { validateMeta } from './validate'

describe('콘텐츠 검증', () => {
  it('모든 MDX 파일의 frontmatter와 참조(related, demo)가 올바르다', () => {
    expect(contentErrors).toEqual([])
    expect(components.length).toBeGreaterThan(0)
  })

  it('잘못된 frontmatter는 필드별 오류를 모두 알려 준다', () => {
    const { meta, errors } = validateMeta({ id: 'Wrong_ID', category: 'unknown' }, 'wrong-id')
    expect(meta).toBeUndefined()
    expect(errors.length).toBeGreaterThanOrEqual(5)
  })

  it('id가 파일명과 다르면 오류로 본다', () => {
    const { errors } = validateMeta(
      {
        id: 'snackbar',
        name: 'Snackbar',
        aliases: [],
        category: 'overlay',
        platforms: ['material'],
        summary: '요약',
        related: [],
        demo: 'SnackbarDemo',
      },
      'toast',
    )
    expect(errors).toEqual(['toast.mdx: id(snackbar)가 파일명(toast)과 다릅니다.'])
  })
})
