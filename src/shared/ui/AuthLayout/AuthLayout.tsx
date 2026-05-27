import { Outlet } from 'react-router-dom';

export const AuthLayout = () => (
  <div className="flex min-h-screen">
    <div className="hidden flex-col items-center justify-center bg-blue-600 p-12 lg:flex lg:w-1/2">
      <div className="max-w-md space-y-6 text-white">
        <h1 className="text-4xl font-bold">AssetFlow AI</h1>
        <p className="text-xl opacity-90">
          AI가 내 주식 포트폴리오를 진단하고, 목표 비중에 맞춘 리밸런싱 액션을 제안하는 자산 관리 서비스
        </p>
        <ul className="space-y-3 text-lg">
          <li>✓ 포트폴리오 현황 한눈에 보기</li>
          <li>✓ AI 기반 리밸런싱 제안</li>
          <li>✓ 3~12개월 예상 수익 시뮬레이션</li>
        </ul>
      </div>
    </div>
    <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
      <Outlet />
    </div>
  </div>
);
