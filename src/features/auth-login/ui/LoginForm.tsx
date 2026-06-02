import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { loginWithEmail, loginWithKakao, sessionAtom } from '@entities/session';
import { Button, ROUTES } from '@shared';
import type { LoginSuccessResult } from '@entities/session';

const emailFieldSchema = z.string().email('올바른 이메일 형식이 아닙니다.');

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const setSession = useSetAtom(sessionAtom);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const handleLoginSuccess = (result: LoginSuccessResult) => {
    setSession({
      userStatus: result.userStatus,
      aiTrialRemainingCount: result.aiTrialRemainingCount,
    });
    const target =
      result.userStatus === 'new' ? ROUTES.ONBOARDING_BROKERAGE : ROUTES.DASHBOARD;
    navigate(target);
  };

  const onEmailSubmit = handleSubmit(async (values) => {
    try {
      const result = await loginWithEmail(values);
      if (!result.success) {
        setError('root', { message: result.errorMessage });
        return;
      }
      handleLoginSuccess(result);
    } catch {
      setError('root', { message: '로그인 중 오류가 발생했습니다.' });
    }
  });

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true);
    try {
      const result = await loginWithKakao();
      if (!result.success) {
        setError('root', { message: result.errorMessage });
        return;
      }
      handleLoginSuccess(result);
    } finally {
      setIsKakaoLoading(false);
    }
  };

  const isFormDisabled = isSubmitting || isKakaoLoading;

  return (
    <form onSubmit={onEmailSubmit} noValidate aria-label="로그인 폼">
      <div className="mb-4">
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
        >
          이메일
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isFormDisabled}
          className="w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email', {
            required: '이메일을 입력해주세요.',
            validate: (value) => {
              const result = emailFieldSchema.safeParse(value);
              return result.success || (result.error.errors[0]?.message ?? '올바른 이메일 형식이 아닙니다.');
            },
          })}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="mt-1 block text-xs text-red-500">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="mb-6">
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
        >
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={isFormDisabled}
          className="w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password', {
            required: '비밀번호를 입력해주세요.',
          })}
        />
        {errors.password && (
          <span id="password-error" role="alert" className="mt-1 block text-xs text-red-500">
            {errors.password.message}
          </span>
        )}
      </div>

      {errors.root && (
        <p role="alert" className="mb-4 rounded-[var(--radius)] bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isFormDisabled}
        className="mb-3 w-full"
      >
        {isSubmitting ? '로그인 중...' : '로그인'}
      </Button>

      <div className="relative mb-3 flex items-center">
        <div className="flex-1 border-t border-[hsl(var(--border))]" />
        <span
          aria-hidden="true"
          className="mx-3 text-xs text-[hsl(var(--muted-foreground))]"
        >
          또는
        </span>
        <div className="flex-1 border-t border-[hsl(var(--border))]" />
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={handleKakaoLogin}
        disabled={isFormDisabled}
        className="w-full"
      >
        {isKakaoLoading ? '처리 중...' : '카카오 로그인'}
      </Button>
    </form>
  );
};
