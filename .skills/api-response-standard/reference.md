---
version: v1.1
---

# API Response 인터페이스 상세 (참조용)

원본: `API response interface.md`

## 백엔드 요청 사항 요약

1. **성공 시**: `result_code` 제거, `data` 래퍼만 사용
2. **실패 시**: HTTP 4xx/5xx 엄수 (200 OK + 에러 바디 금지)

## JSON 예시

### 단일 리소스 성공

```json
{
  "data": {
    "id": 1,
    "name": "Device A"
  }
}
```

### 목록 성공

```json
{
  "data": [
    { "id": 1, "name": "Device A" },
    { "id": 2, "name": "Device B" }
  ],
  "meta": {
    "page": 1,
    "size": 10,
    "total": 45
  }
}
```

### 에러 (4xx/5xx body)

```json
{
  "message": "에러 로그 메시지",
  "result_code": 257
}
```
