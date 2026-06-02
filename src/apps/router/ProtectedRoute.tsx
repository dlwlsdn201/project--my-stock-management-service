import { useAtomValue } from 'jotai';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { sessionAtom } from '@entities/session';
import { ROUTES } from '@shared';

interface ProtectedRouteProps {
  children: ReactNode;
}

/** 인증 필요 라우트 가드. 비로그인 시 /login으로 redirect한다. */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const session = useAtomValue(sessionAtom);

  if (!session) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};
