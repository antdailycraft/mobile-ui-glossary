import { describe, expect, it } from 'vitest'
import { normalize, searchComponents } from './search'
import type { ComponentMeta } from './types'

const make = (id: string, name: string, aliases: string[] = [], summary = ''): ComponentMeta => ({
  id,
  name,
  aliases,
  summary,
  category: 'overlay',
  platforms: ['material'],
  related: [],
  demo: 'X',
})

const items = [
  make('kebab-menu', 'Kebab Menu', ['Overflow Menu', 'more_vert', '더보기 메뉴']),
  make('modal-bottom-sheet', 'Modal Bottom Sheet', ['바텀 시트']),
  make('snackbar', 'Snackbar', [], '실행 취소 버튼을 함께 제공'),
]

describe('normalize', () => {
  it('대소문자·공백·하이픈·밑줄 차이를 무시한다', () => {
    expect(normalize('Bottom-Sheet')).toBe(normalize('bottom sheet'))
    expect(normalize('more_vert')).toBe('morevert')
  })
})

describe('searchComponents', () => {
  it('검색어가 비어 있으면 전체를 돌려준다', () => {
    expect(searchComponents(items, '  ')).toHaveLength(3)
  })

  it('별칭과 한국어 이름으로도 찾는다', () => {
    expect(searchComponents(items, 'overflow').map((c) => c.id)).toEqual(['kebab-menu'])
    expect(searchComponents(items, '바텀').map((c) => c.id)).toEqual(['modal-bottom-sheet'])
    expect(searchComponents(items, 'morevert').map((c) => c.id)).toEqual(['kebab-menu'])
  })

  it('이름 일치를 요약 일치보다 앞에 둔다', () => {
    const list = [make('a', 'Undo Thing'), make('b', 'Other', [], 'undo 지원')]
    expect(searchComponents(list, 'undo').map((c) => c.id)).toEqual(['a', 'b'])
  })
})

describe('검색 확장과 필터', () => {
  const list: ComponentMeta[] = [
    { ...make('modal-bottom-sheet', 'Modal Bottom Sheet', ['바텀 시트']), platforms: ['material', 'ios'] },
    { ...make('bottom-navigation', 'Bottom Navigation', ['하단 탐색']), category: 'navigation' },
    { ...make('action-sheet', 'Action Sheet', ['액션 시트']), platforms: ['ios'] },
  ]

  it('단어 순서가 달라도 모든 검색 단어가 포함된 항목을 찾는다', () => {
    expect(searchComponents(list, 'sheet modal').map((c) => c.id)).toEqual(['modal-bottom-sheet'])
    expect(searchComponents(list, 'modal 바텀').map((c) => c.id)).toEqual(['modal-bottom-sheet'])
    expect(searchComponents(list, 'modal 없음')).toEqual([])
  })

  it('연속 일치를 단어별 일치보다 먼저 보여 준다', () => {
    const ranked = [make('a', 'Sheet Modal'), make('b', 'Modal Sheet')]
    expect(searchComponents(ranked, 'modal sheet').map((c) => c.id)).toEqual(['b', 'a'])
  })

  it('카테고리와 플랫폼, 검색어를 모두 적용한다', () => {
    expect(searchComponents(list, 'sheet', { category: 'overlay', platform: 'ios' })).toHaveLength(2)
    expect(searchComponents(list, '', { category: 'navigation', platform: 'ios' })).toEqual([])
    expect(searchComponents(list, '', { platform: 'material' }).map((c) => c.id))
      .toEqual(['modal-bottom-sheet', 'bottom-navigation'])
    expect(list).toHaveLength(3)
  })

  it('분해된 한글과 구분자만 있는 검색어도 처리한다', () => {
    expect(searchComponents(list, '바텀'.normalize('NFD')).map((c) => c.id)).toEqual(['modal-bottom-sheet'])
    expect(searchComponents(list, ' /-_ ')).toEqual(list)
  })
})
