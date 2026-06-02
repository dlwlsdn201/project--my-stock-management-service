import { useAtomValue } from 'jotai';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { sessionAtom } from '@entities/session';
import { ROUTES } from '@shared';

interface PublicOnlyRouteProps {
  children: ReactNode;
}

/**
 * 비로그인 전용 라우트 가드(예: /login).
 * 로그인 사용자는 userStatus에 따라 내부 화면으로 redirect한다.
 */
export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const session = useAtomValue(sessionAtom);

  if (session) {
    const target =
      session.userStatus === 'new' ? ROUTES.ONBOARDING_BROKERAGE : ROUTES.DASHBOARD;
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};
