import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/*
 * src/demos/*Demo.tsx 파일을 자동으로 수집한다. 새 데모를 추가할 때 이 파일을 고칠 필요가 없다.
 * 하위 폴더(_shared/)는 패턴에 걸리지 않으므로 공용 코드를 두어도 레지스트리에 섞이지 않는다.
 */
const loaders = import.meta.glob<{ default: ComponentType }>('../demos/*Demo.tsx')

const nameOf = (path: string) => path.slice(path.lastIndexOf('/') + 1).replace(/\.tsx$/, '')

const registry = new Map(Object.entries(loaders).map(([path, load]) => [nameOf(path), load]))

export const demoNames = [...registry.keys()]

// lazy()는 같은 컴포넌트에 대해 한 번만 만들어야 리렌더 때마다 다시 로딩되지 않는다.
const cache = new Map<string, LazyExoticComponent<ComponentType>>()

export function getDemo(name: string): LazyExoticComponent<ComponentType> | undefined {
  const load = registry.get(name)
  if (!load) return undefined
  let Demo = cache.get(name)
  if (!Demo) {
    Demo = lazy(load)
    cache.set(name, Demo)
  }
  return Demo
}

/** React.lazy가 기억한 실패를 지워 다음 시도에서 로더를 다시 호출한다. */
export function resetDemo(name: string): void {
  cache.delete(name)
}
