export type UserStatus = 'new' | 'existing';

export interface MockAccount {
  id: string;
  email: string;
  password: string;
  userStatus: UserStatus;
  aiTrialRemainingCount: number;
}

export interface LoginSuccessResult {
  success: true;
  userStatus: UserStatus;
  aiTrialRemainingCount: number;
}

export interface LoginFailureResult {
  success: false;
  errorMessage: string;
}

export type LoginResult = LoginSuccessResult | LoginFailureResult;

export interface LoginEmailPayload {
  email: string;
  password: string;
}
