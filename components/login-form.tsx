"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { baseUrl, fetcher } from "@/lib/utils"
import Link from "next/link"
import useSWR from "swr";

export function LoginForm() {
  
  

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          계정에 로그인하여 Holy Club을 시작하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" placeholder="name@example.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">비밀번호</Label>
            <Link href="/forgot-password" className="text-sm text-primary">
              비밀번호 찾기
            </Link>
          </div>
          <Input id="password" type="password" />
        </div>

        <Button className="w-full">로그인</Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              또는 소셜 로그인
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => kakaoLogin()}
          >
            카카오톡
          </Button>
          <Button variant="outline" className="w-full">
            구글
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-center text-sm text-muted-foreground mt-2">
          계정이 없으신가요?{" "}
          <Link href="/register" className="text-primary">
            회원가입
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
