import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { clearSessionAtom } from '@entities/session';
import { Button, ROUTES } from '@shared';

export const LogoutButton = () => {
  const clearSession = useSetAtom(clearSessionAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate(ROUTES.LOGIN);
  };

  return (
    <Button type="button" variant="ghost" onClick={handleLogout}>
      로그아웃
    </Button>
  );
};
