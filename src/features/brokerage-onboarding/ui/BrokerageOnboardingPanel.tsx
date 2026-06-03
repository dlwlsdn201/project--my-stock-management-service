import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BROKERAGE_ONBOARDING_STEPS,
  BROKERAGE_PROVIDERS,
  connectBrokerage,
  SECURITY_BADGES,
} from '@entities/brokerage';
import type { BrokerageProvider } from '@entities/brokerage';
import { Button, ROUTES } from '@shared';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'failed';

const STATUS_STEP_INDEX: Record<ConnectionStatus, number> = {
  idle: 0,
  failed: 0,
  connecting: 1,
  connected: 2,
};

export const BrokerageOnboardingPanel = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<BrokerageProvider | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedQuery = searchQuery.trim();
  const filteredProviders = trimmedQuery
    ? BROKERAGE_PROVIDERS.filter((provider) => provider.name.includes(trimmedQuery))
    : BROKERAGE_PROVIDERS;

  const currentStepIndex = STATUS_STEP_INDEX[status];

  const handleConnect = async (provider: BrokerageProvider) => {
    setSelectedProvider(provider);
    setStatus('connecting');
    setErrorMessage(null);

    const result = await connectBrokerage(provider.id);

    if (result.success) {
      setStatus('connected');
      return;
    }

    setStatus('failed');
    setErrorMessage(result.errorMessage ?? '연결에 실패했습니다.');
  };

  const handleGoToDashboard = () => navigate(ROUTES.DASHBOARD);

  const isConnecting = status === 'connecting';

  return (
    <section aria-label="증권사 연동 온보딩" className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <ol aria-label="연동 진행 단계" className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {BROKERAGE_ONBOARDING_STEPS.map((stepLabel, index) => {
          const isDone = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          return (
            <li
              key={stepLabel}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex flex-1 items-center gap-2 text-sm"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isDone || isCurrent
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                }`}
              >
                {index + 1}
              </span>
              <span
                className={
                  isCurrent
                    ? 'font-medium text-[hsl(var(--foreground))]'
                    : 'text-[hsl(var(--muted-foreground))]'
                }
              >
                {stepLabel}
              </span>
            </li>
          );
        })}
      </ol>

      {status === 'connected' && selectedProvider ? (
        <div
          role="status"
          className="flex flex-col items-center gap-4 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center"
        >
          <span aria-hidden="true" className="text-3xl">
            ✓
          </span>
          <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
            {selectedProvider.name} 연결이 완료되었습니다
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            이제 포트폴리오 데이터를 동기화할 수 있습니다.
          </p>
          <Button variant="primary" onClick={handleGoToDashboard}>
            대시보드로 이동
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="brokerage-search"
              className="text-sm font-medium text-[hsl(var(--foreground))]"
            >
              증권사 검색
            </label>
            <input
              id="brokerage-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="증권사명을 입력하세요"
              disabled={isConnecting}
              className="w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-[var(--radius)] bg-[hsl(var(--destructive)/0.12)] px-4 py-3 text-sm text-[hsl(var(--destructive))] sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{errorMessage}</span>
              {selectedProvider && (
                <Button
                  variant="secondary"
                  onClick={() => handleConnect(selectedProvider)}
                  disabled={isConnecting}
                >
                  다시 시도
                </Button>
              )}
            </div>
          )}

          <ul aria-label="증권사 목록" className="grid gap-3 sm:grid-cols-2">
            {filteredProviders.map((provider) => {
              const isProviderConnecting = isConnecting && selectedProvider?.id === provider.id;
              return (
                <li
                  key={provider.id}
                  className="flex flex-col gap-3 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[hsl(var(--foreground))]">
                        {provider.name}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {provider.supportedFeatures.join(' · ')}
                      </span>
                    </div>
                    {provider.isPopular && (
                      <span className="shrink-0 rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">
                        인기
                      </span>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    aria-label={`${provider.name} 연결하기`}
                    onClick={() => handleConnect(provider)}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isProviderConnecting ? '연결 중...' : '연결하기'}
                  </Button>
                </li>
              );
            })}
          </ul>

          {filteredProviders.length === 0 && (
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              검색 결과가 없습니다.
            </p>
          )}

          <div className="flex flex-col gap-4">
            <Button variant="ghost" onClick={handleGoToDashboard} disabled={isConnecting}>
              나중에 하기
            </Button>

            <ul
              aria-label="보안 안내"
              className="flex flex-wrap items-center justify-center gap-3 text-xs text-[hsl(var(--muted-foreground))]"
            >
              {SECURITY_BADGES.map((badge) => (
                <li key={badge} className="flex items-center gap-1">
                  <span aria-hidden="true">🔒</span>
                  {badge}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
};
