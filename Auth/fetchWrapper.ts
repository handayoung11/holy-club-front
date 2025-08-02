import { baseUrl } from "@/lib/utils";

// fetchWrapper.ts
export async function fetchWithAuthRetry(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status !== 401) {
    return response;
  }

  // 401이면 토큰 갱신 시도
    const refreshed = await fetch(`${baseUrl}/token/refresh`, {
        method:"POST"
    });
    
    

  if (!refreshed) {
    // refresh 실패 → 그대로 에러 응답 반환
    return response;
  }

  // accessToken 재설정 필요 시 여기서 해줌
  const retryInit = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${getAccessToken()}`,
    },
  };

  // 갱신 성공했으면 원래 요청 다시 시도
  return await fetch(input, retryInit);
}
