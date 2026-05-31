import { BROKERAGE_CONNECTION_ERROR_MESSAGE } from '../model/constants';
import type { ConnectBrokerageResult } from '../model/types';

// Mock: 토스증권은 인증 토큰 만료 상태를 재현해 항상 실패한다. 나머지는 성공으로 처리한다.
const FAILING_PROVIDER_IDS = new Set<string>(['toss']);

export const connectBrokerage = async (
  providerId: string,
): Promise<ConnectBrokerageResult> => {
  if (FAILING_PROVIDER_IDS.has(providerId)) {
    return {
      success: false,
      providerId,
      errorMessage: BROKERAGE_CONNECTION_ERROR_MESSAGE,
    };
  }

  return { success: true, providerId };
};
