import type { LoginEmailPayload, LoginResult } from '../model/types';
import { DEFAULT_AI_TRIAL_COUNT, LOGIN_ERROR_MESSAGES } from '../model/constants';
import { MOCK_ACCOUNTS } from '../model/mockSession';

export const loginWithEmail = async (payload: LoginEmailPayload): Promise<LoginResult> => {
  const account = MOCK_ACCOUNTS.find(
    (acc) => acc.email === payload.email && acc.password === payload.password,
  );

  if (!account) {
    return { success: false, errorMessage: LOGIN_ERROR_MESSAGES.INVALID_CREDENTIALS };
  }

  return { success: true, userStatus: account.userStatus, aiTrialRemainingCount: account.aiTrialRemainingCount };
};

export const loginWithKakao = async (): Promise<LoginResult> => {
  // Mock Kakao: 항상 기존 사용자 성공으로 처리
  return { success: true, userStatus: 'existing', aiTrialRemainingCount: DEFAULT_AI_TRIAL_COUNT };
};
