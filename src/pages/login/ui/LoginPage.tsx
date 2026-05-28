import { Button } from '@shared';

export const LoginPage = () => (
  <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[hsl(var(--background))]">
    <div className="flex flex-col items-center gap-2">
      <h1 className="text-3xl font-bold">AssetFlow AI</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">AI 기반 포트폴리오 진단 서비스</p>
    </div>
    <Button variant="primary" disabled>
      로그인 (준비 중)
    </Button>
  </div>
);
