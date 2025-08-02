"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseUrl, fetcher } from "@/lib/utils";
import { useEffect } from "react";

export default function LoginPage() {
  
  const loginEnd = async () => {

    try {
      const response = await fetch(`${baseUrl}/token`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("로그인에 실패했습니다.");
      }
      console.log("loginActive", response);
      const body = response.body;
      if (body === null) {
        return;
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
      location.href = "/";

    } catch (err) {}
    
  
    // try {
    //   const response = await fetch(`${baseUrl}/token`, {
    //     credentials: "include",
    //   });

    //   if (!response.ok) {
       
    //     throw new Error("로그인에 실패했습니다.");
    //   }

      
    //   console.log("loginActive", response);
    // } catch (err) {}
  };


  useEffect(() => {
    loginEnd();
  }, [])
  

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto bg-slate-50">
      <div className="flex-1 p-4 flex items-center justify-center">
        <Card className="w-full border-none shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              HolyClub에 오신걸 환영합니다!
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
