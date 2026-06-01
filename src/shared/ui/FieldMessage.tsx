import type { ReactNode } from 'react';

type FieldMessageTone = 'error' | 'info';

interface FieldMessageProps {
  tone?: FieldMessageTone;
  children: ReactNode;
  className?: string;
  id?: string;
}

const TONE_CLASS: Record<FieldMessageTone, string> = {
  error: 'text-red-600',
  info: 'text-[hsl(var(--muted-foreground))]',
};

// error 톤은 role="alert"로 즉시 안내하고, 그 외 정보 메시지는 일반 텍스트로 표시한다.
// id를 전달하면 입력 요소의 aria-describedby와 연결할 수 있다.
export const FieldMessage = ({ tone = 'info', children, className = '', id }: FieldMessageProps) => (
  <p
    id={id}
    role={tone === 'error' ? 'alert' : undefined}
    className={`text-sm ${TONE_CLASS[tone]} ${className}`}
  >
    {children}
  </p>
);
