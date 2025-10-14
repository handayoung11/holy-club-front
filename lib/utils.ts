import { Bible } from "@/components/pober-list";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export const baseUrl = "http://cuvetechnlogis.ddns.net";
// export const baseUrl = "http://localhost:8080";
// export const baseUrl = "https://6035cb8c7fbc.ngrok-free.app";
export const baseUrl = "https://holy-club-back-production.up.railway.app";
// export const baseUrl = "http://192.168.45.60:8080";
// export const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 쿠키에서 토큰을 확인하는 함수
export function getTokenFromLocalStorage(): string | null {
  if (typeof document === 'undefined') return null;
  
  const token = localStorage.getItem("token");
  
  if (token) {
    return token;
  }
  
  return null;
}

// 로그인 상태를 확인하는 함수
export function isLoggedIn(): boolean {
  const token = getTokenFromLocalStorage();
  return token !== null && token !== '';
}

// 로그아웃 함수
export function logout(goHome: boolean = true): void {
  if (typeof document === 'undefined') return;
  
  // 토큰 쿠키 삭제
  fetch(`${baseUrl}/token`, {
      method: "DELETE"
  });
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  localStorage.removeItem('token');
  
  // 로그인 페이지로 리다이렉트
  if (goHome) window.location.href = '/login';
}

// 백엔드 API 호출을 위한 기본 설정
export const API_BASE_URL = 'http://localhost:8080';

// API 호출 함수
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // 쿠키 포함
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API 호출 에러:', error);
    throw error;
  }
}

// Pober 목록 가져오기
export async function fetchPoberList(params: {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  name?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.size) searchParams.append('size', params.size.toString());
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.name) searchParams.append('name', params.name);
  
  const queryString = searchParams.toString();
  const endpoint = `/pober${queryString ? `?${queryString}` : ''}`;
  
  return apiCall(endpoint);
}

// 개별 Pober 가져오기
export async function fetchPoberDetail(id: string) {
  return apiCall(`/pober/${id}`);
}

// 댓글 작성
export async function createComment(data: {
  content: string;
  poberId: number;
  commentId?: number;
}) {
  return apiCall('/pober-comment', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 댓글 수정
export async function updateComment(commentId: number, content: string) {
  return apiCall(`/pober-comment/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
}

// 댓글 삭제
export async function deleteComment(commentId: number) {
  return apiCall(`/pober-comment/${commentId}`, {
    method: 'DELETE',
  });
}

// 좋아요 토글
export async function toggleLike(poberId: number) {
  return apiCall(`/pober/like/${poberId}`, {
    method: 'POST',
  });
}

export function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

export function formatDateTime(date: Date): string {
  
  const year = String(date.getFullYear()).slice(2); // "25"
  const month = String(date.getMonth() + 1).padStart(2, "0"); // "10"
  const day = String(date.getDate()).padStart(2, "0"); // "13"

  let hour = date.getHours() + 9; // 한국시간으로 변경
  const minute = String(date.getMinutes()).padStart(2, "0");
  const ampm = hour < 12 ? "오전" : "오후";
  hour = hour % 12 || 12; 

  const formatted = `${year}.${month}.${day} ${ampm} ${hour}시 ${minute}분`;

  console.log(formatted);
  return formatted;
}

export const formatBible = (bible: Bible) => {
  const { chapter, start, end } = bible;
  return start !== end
    ? `${chapter} ${start}~${end}장`
    : `${chapter} ${start}장`;
};