"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { baseUrl } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { fetchWithAuthRetry } from "@/Auth/fetchWrapper";
import { useSearchParams } from "next/navigation";

const SOURCE_OPTIONS = [
  {key: 'HLS', val: "지성소 예배"},
  {key: 'YJA', val: "청소년지저스아미",},
  {key: 'ICC', val: "마가의 다락방",},
  {key: 'EPHA', val: "에바다교회"},
];

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const bypass = searchParams.get("bypass") === "true";

  const loginEnd = async () => {
    try {
      const response = await fetch(`${baseUrl}/token`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("로그인에 실패했습니다.");
      }

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

      const res = await fetchWithAuthRetry(`${baseUrl}/user/me`);
      if (res.ok) {
        const data = await res.json();
        if (data.communities.length == 0) {
          setIsLoggedIn(true);
          return;
        }
      }

      if (!bypass) window.location.href = "/";
    } catch (err) {
      console.error(err);
      location.href = "/";
    }
  };

  const handleSourceToggle = (source: string) => {
    setSelectedSources(prev => {
      const newSources = prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source];

      return newSources;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("communities", selectedSources.join(","));

      const res = await fetchWithAuthRetry(`${baseUrl}/user/me/community`, {
        method: "PATCH",
        body: formData
      });


      if (!res.ok) {
        throw new Error("공동체 저장에 실패했습니다.");
      }
      location.href = "/";
    } catch (err) {
      console.error(err);
      toast({
        title: "공동체 저장 실패", 
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loginEnd();
  }, []);

  if (!isLoggedIn && !bypass) {
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

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto bg-slate-50">
      <div className="flex-1 p-4 flex items-center justify-center">
        <Card className="w-full border-none shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              어디서 오셨나요?
            </CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              중복 선택 가능
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {SOURCE_OPTIONS.map((s) => (
                <div key={s.key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={s.key}
                    checked={selectedSources.includes(s.key)}
                    onCheckedChange={() => handleSourceToggle(s.key)}
                  />
                  <label
                    htmlFor={s.key}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {s.val}
                  </label>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-12"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedSources.length === 0}
            >
              {isSubmitting ? "저장 중..." : "완료"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
