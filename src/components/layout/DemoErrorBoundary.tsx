import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onRetry: () => void
}

/** 데모의 로딩·렌더링 실패가 용어 설명과 탐색 화면까지 중단시키지 않게 한다. */
export class DemoErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div role="alert" className="p-6">
        <p className="text-title-md text-error">데모를 표시하지 못했습니다</p>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          다시 시도하거나 페이지를 새로고침해 주세요. 용어 설명과 다른 컴포넌트는 계속 볼 수 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={this.props.onRetry}
            className="state-layer min-h-11 rounded-full bg-primary px-5 text-label-lg text-on-primary"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="state-layer min-h-11 rounded-full px-5 text-label-lg text-primary"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    )
  }
}
