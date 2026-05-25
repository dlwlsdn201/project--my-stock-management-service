---
version: v1.2
name: api-response-interface
description: Enbrix API 응답 인터페이스 표준을 적용한다. 새 API 엔티티 구현, 백엔드 API 스펙 제안, 타입 정의, baseApiModule 수정 시 사용. API Response 재설계, result_code, data 래퍼, 가짜 성공 금지, 에러 응답 구조 관련 작업 시 적용.
---

# API 응답 인터페이스 표준

프론트엔드 팀이 백엔드와 합의한 API 응답 계약. 새 API 연동·타입 정의·백엔드 협의 시 이 표준을 따른다.

## 핵심 원칙: 가짜 성공(Fake 200 OK) 금지

비즈니스 실패 시 **반드시 HTTP 4xx/5xx** 반환.

| 금지 | 권장 |
|------|------|
| HTTP 200 + `{ success: false }` | HTTP 400/500 + 에러 바디 |
| HTTP 200 + `{ result_code: -1 }` | — |

**이유**: ErrorBoundary·React Query는 HTTP 상태 코드 기반. 200이면 에러 감지 실패 → 블랙아웃/화이트스크린.

## 성공 응답 (HTTP 2xx)

`result_code` 제거. `data` 래퍼만 사용.

**단일 리소스:**

```ts
interface ApiSuccessResponse<T> {
  data: T;  // Record | string | number
}
```

**목록·페이지네이션:**

```ts
interface ApiSuccessResponse<T> {
  data: T;  // 객체[] | string[] | number[] 등
  meta?: {
    page: number;
    size: number;
    total: number;
  };
}
```

## 에러 응답 (HTTP 4xx, 5xx)

`errors.ts`(RESULT_CODE, ERROR_CODES) 연동용 필드 유지.

```json
{
  "message": "사용자 노출용 메시지 (필수)",
  "result_code": 257
}
```

## 작업 시 체크리스트

- [ ] Entity API 반환 타입: `ApiSuccessResponse<DataType>` 사용
- [ ] 목록 API: `meta`(page, size, total) 포함 여부 확인
- [ ] baseApiModule: 성공 시 `data`만 unwrap, 에러는 HTTP 상태 기반
- [ ] 성공 응답(및 MSW mock JSON) 최상위가 **`{ "data": ... }`** 인지 — raw 배열·단일 객체 루트 금지 (`project-rules_api-response-interface.mdc` §2)
- [ ] 백엔드 협의 시: `API response interface.md` 또는 Rule 참조

## 참조

- Rule: `.cursor/rules/project-rules_api-response-interface.mdc`
- 상세 문서: `API response interface.md`
- 팀 공통 응답 규격(명세 작성 시): [Google Docs](https://docs.google.com/document/d/1b8gV3meipFY88kPQEil67nvR4wYagr4vDRh71JiguZk/edit?tab=t.0#heading=h.rtcbq5b75vcg)
