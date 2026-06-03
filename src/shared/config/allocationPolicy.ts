// 자산 배분 허용 오차 정책 SSOT.
// 현재 비중과 목표 비중의 차이가 이 값(%) 이내이면 'hold'로 판단한다.
// portfolio 계산 로직과 rebalancing mock 테스트가 같은 정책을 참조한다.
export const ALLOCATION_TOLERANCE_PERCENT = 0.5;
