import { LoginForm } from '@features/auth-login';

export const LoginPage = () => (
  <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] md:flex-row">
    {/* 좌측: 브랜딩 패널 (50%) */}
    <div className="flex flex-col items-center justify-center gap-6 bg-[hsl(var(--primary))] p-8 text-[hsl(var(--primary-foreground))] md:w-1/2 md:p-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-bold">AssetFlow AI</h1>
        <p className="text-lg opacity-90">AI 기반 포트폴리오 진단 서비스</p>
      </div>

      <ul className="space-y-3 text-sm" aria-label="서비스 특징">
        <li className="flex items-center gap-2">
          <span aria-hidden="true">✓</span>
          증권사 자동 연동으로 손쉬운 자산 관리
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true">✓</span>
          AI 리밸런싱 추천 및 목표 비중 관리
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true">✓</span>
          실시간 포트폴리오 분석과 진단
        </li>
      </ul>

      <p className="text-center text-xs opacity-60">
        본 서비스는 투자 판단 보조 정보를 제공하며 수익을 보장하지 않습니다.
      </p>
    </div>

    {/* 우측: 로그인 폼 패널 (50%) */}
    <div className="flex flex-1 flex-col items-center justify-center p-6 md:w-1/2 md:p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">로그인</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            계정에 로그인하여 포트폴리오를 관리하세요
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
          로그인 정보는 암호화되어 안전하게 보호됩니다.
        </p>
      </div>
    </div>
  </div>
);
