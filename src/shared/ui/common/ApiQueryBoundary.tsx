import { Component, Suspense } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

const DEFAULT_ERROR_MESSAGE = '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
const RETRY_LABEL = '다시 시도';

interface ApiErrorFallbackProps {
  onRetry: () => void;
  message?: string;
}

// 기본 에러 UI(메시지 + 재시도). role="alert"로 즉시 안내한다.
export const ApiErrorFallback = ({ onRetry, message = DEFAULT_ERROR_MESSAGE }: ApiErrorFallbackProps) => (
  <div role="alert" className="flex flex-col items-center justify-center gap-3 py-8 text-center">
    <p className="text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--secondary))] px-4 py-2 text-sm font-medium text-[hsl(var(--secondary-foreground))] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
    >
      {RETRY_LABEL}
    </button>
  </div>
);

interface ErrorBoundaryInnerProps {
  children: ReactNode;
  onReset: () => void;
  renderFallback: (reset: () => void) => ReactNode;
}

interface ErrorBoundaryInnerState {
  hasError: boolean;
}

// React 에러 바운더리는 클래스 컴포넌트만 지원하므로 화살표 함수 규칙의 불가피한 예외다.
class ErrorBoundaryInner extends Component<ErrorBoundaryInnerProps, ErrorBoundaryInnerState> {
  state: ErrorBoundaryInnerState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryInnerState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // 관측 지점(후속: 로깅 연동). 현재는 fallback 렌더만 수행한다.
  }

  handleReset = (): void => {
    this.props.onReset();
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.renderFallback(this.handleReset);
    }
    return this.props.children;
  }
}

interface ApiQueryBoundaryProps {
  children: ReactNode;
  pendingFallback?: ReactNode;
  errorFallback?: (reset: () => void) => ReactNode;
}

// useSuspenseQuery 사용 컴포넌트의 표준 래퍼: 로딩(Suspense) + 에러(ErrorBoundary) 일원화.
export const ApiQueryBoundary = ({
  children,
  pendingFallback = null,
  errorFallback,
}: ApiQueryBoundaryProps) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundaryInner
        onReset={reset}
        renderFallback={(retry) =>
          errorFallback ? errorFallback(retry) : <ApiErrorFallback onRetry={retry} />
        }
      >
        <Suspense fallback={pendingFallback}>{children}</Suspense>
      </ErrorBoundaryInner>
    )}
  </QueryErrorResetBoundary>
);
