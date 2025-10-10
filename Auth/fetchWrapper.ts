import { baseUrl, getTokenFromLocalStorage, isLoggedIn, logout } from "@/lib/utils";

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


  if (!refreshed.ok && refreshed.status !== 422) {
    // refresh 실패 → 그대로 에러 응답 반환
    const json = await refreshed.json();
    if (json.doLogout) {
      logout(false);
      window.location.href = `/?error=true`;
    }
    return response;
  }

  let result = "";
  if (refreshed.status === 422) {
    const token = getTokenFromCookie();
    if (token === null) return response;
    result = token;
  } else {
    const body = refreshed.body;
    if (body === null) {
      return response;
    }

    const reader = body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
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

// 쿠키에서 토큰을 확인하는 함수
export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('token=')
  );
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  
  return null;
}
