import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LoginForm } from './LoginForm';

const renderLoginForm = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<div>Dashboard 페이지</div>} />
        <Route path="/onboarding/brokerage" element={<div>온보딩 페이지</div>} />
      </Routes>
    </MemoryRouter>,
  );
  return { user };
};

describe('LoginForm', () => {
  it('이메일 미입력 시 유효성 에러를 표시한다', async () => {
    const { user } = renderLoginForm();
    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByText('이메일을 입력해주세요.')).toBeInTheDocument();
  });

  it('올바르지 않은 이메일 형식 입력 시 형식 에러를 표시한다', async () => {
    const { user } = renderLoginForm();
    await user.type(screen.getByLabelText('이메일'), 'notanemail');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument();
  });

  it('비밀번호 미입력 시 유효성 에러를 표시한다', async () => {
    const { user } = renderLoginForm();
    await user.type(screen.getByLabelText('이메일'), 'user@assetflow.ai');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
  });

  it('신규 사용자 이메일 로그인 성공 시 /onboarding/brokerage로 이동한다', async () => {
    const { user } = renderLoginForm();
    await user.type(screen.getByLabelText('이메일'), 'new@assetflow.ai');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(screen.getByText('온보딩 페이지')).toBeInTheDocument();
    });
  });

  it('기존 사용자 이메일 로그인 성공 시 /dashboard로 이동한다', async () => {
    const { user } = renderLoginForm();
    await user.type(screen.getByLabelText('이메일'), 'user@assetflow.ai');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(screen.getByText('Dashboard 페이지')).toBeInTheDocument();
    });
  });

  it('잘못된 자격증명 로그인 실패 시 에러 메시지를 표시하고 페이지를 유지한다', async () => {
    const { user } = renderLoginForm();
    await user.type(screen.getByLabelText('이메일'), 'wrong@assetflow.ai');
    await user.type(screen.getByLabelText('비밀번호'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(
        screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.'),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('카카오 로그인 성공 시 /dashboard로 이동한다', async () => {
    const { user } = renderLoginForm();
    await user.click(screen.getByRole('button', { name: '카카오 로그인' }));
    await waitFor(() => {
      expect(screen.getByText('Dashboard 페이지')).toBeInTheDocument();
    });
  });
});
