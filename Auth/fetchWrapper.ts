import { baseUrl, getTokenFromLocalStorage, isLoggedIn } from "@/lib/utils";

// fetchWrapper.ts
export async function fetchWithAuthRetry(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});

  // 로그인 상태이면 토큰 추가
  const isUser = isLoggedIn();
  if (isUser) {
    const token = getTokenFromLocalStorage();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });

  // 401이고 로그인 상태일 경우 토큰 갱신 시도
  if (!isUser || response.status !== 401) {
    return response;
  }

  // 401이면 토큰 갱신 시도
  const refreshed = await fetch(`${baseUrl}/token/refresh`, {
    credentials: "include",
    method: "POST",
  });

  if (!refreshed.ok) {
    // refresh 실패 → 그대로 에러 응답 반환
    return response;
  }

  const body = refreshed.body;
  if (body === null) {
    return response;
  }

  const reader = body.getReader();
  let result = "";
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  
  localStorage.setItem("token", result);

  // accessToken 재설정 필요 시 여기서 해줌
  const retryInit = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${result}`,
    },
  };

  // 갱신 성공했으면 원래 요청 다시 시도
  return await fetch(input, retryInit);
}
