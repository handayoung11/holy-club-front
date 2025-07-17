"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, BarChart, Settings, LogIn, PenSquare, User, LogOut } from "lucide-react"
import { isLoggedIn, logout } from "@/lib/utils"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function MobileSidebar() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    // 초기 로그인 상태 확인
    setIsUserLoggedIn(isLoggedIn());

    // 쿠키 변경 감지를 위한 이벤트 리스너
    const checkLoginStatus = () => {
      setIsUserLoggedIn(isLoggedIn());
    };

    // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시)
    window.addEventListener('storage', checkLoginStatus);
    
    // 주기적으로 쿠키 상태 확인 (선택사항)
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const linkButtonClass = "inline-flex w-full items-center justify-start whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 text-base px-3 py-2 hover:bg-accent hover:text-accent-foreground";

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Holy Club</h2>
        <div className="space-y-1">
          <Link href="/" className={cn(linkButtonClass, "bg-transparent")}>
            <Home className="mr-2 h-5 w-5" />홈
          </Link>
          <Link href="/write" className={cn(linkButtonClass, "bg-transparent")}>
            <PenSquare className="mr-2 h-5 w-5" />
            기록하기
          </Link>
          <Link href="/stats" className={cn(linkButtonClass, "bg-transparent")}>
            <BarChart className="mr-2 h-5 w-5" />
            통계
          </Link>
          <Link href="/settings" className={cn(linkButtonClass, "bg-transparent")}>
            <Settings className="mr-2 h-5 w-5" />
            설정
          </Link>
        </div>
      </div>
      <div className="mt-auto px-3 py-2 space-y-2">
        {!isUserLoggedIn ? (
          <Link href="/login" className={cn(linkButtonClass, "border border-input bg-background hover:bg-accent hover:text-accent-foreground")}>
            <LogIn className="mr-2 h-5 w-5" />
            로그인
          </Link>
        ) : (
          <>
            <Link href="/profile" className={cn(linkButtonClass, "border border-input bg-background hover:bg-accent hover:text-accent-foreground")}>
              <User className="mr-2 h-5 w-5" />
              프로필
            </Link>
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 text-base text-red-600 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              로그아웃
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
