"use client"

import { useEffect, useState, Suspense } from "react";
import { MobileHeader } from "@/components/mobile-header"
import { useRouter, useSearchParams } from "next/navigation";
import { MobileNavigation } from "@/components/mobile-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { baseUrl, getTokenFromLocalStorage } from "@/lib/utils";
import { LoginRequiredStatsDialog } from "@/components/login-required-stat-dialog";

export default function StatsPage() {
  const [currentWeek, setCurrentWeek] = useState("이번 주");

  const [weeklyBibleData, setWeeklyBibleData] = useState<
  { day: string; chapters: number; books: string[] }[]>
  ([]);

  const [weeklyPrayerData, setWeeklyPrayerData] = useState<
  { day: string; minutes: number }[]>
  ([]);

  const totalBibleChapters = weeklyBibleData.reduce(
    (sum, day) => sum + day.chapters,
    0
  );
  const totalPrayerMinutes = weeklyPrayerData.reduce(
    (sum, day) => sum + day.minutes,
    0
  );
  const prayerDays = weeklyPrayerData.filter((day) => day.minutes > 0).length;
  const bibleDays = weeklyBibleData.filter((day) => day.chapters > 0).length;

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bypass = searchParams.get("bypass") === "true";
  const token = getTokenFromLocalStorage();

  // 로그인 상태를 확인하는 함수
  const isLoggedIn = () => {
    return token !== null && token !== "";
  };

  interface bibleEntry {
    start: number;
    end: number;
    chapter: string;
  }

  const getDetailData = async () => {
    let prayerUrl = `${baseUrl}/pober/stat/week/prayer`;
    const prayerResponse = await fetch(prayerUrl, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const prayerData = await prayerResponse.json();

    let bibleUrl = `${baseUrl}/pober/stat/week/bible`;
    const bibleResponse = await fetch(bibleUrl, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const bibleData = await bibleResponse.json();

    const prayerList = [];
    const bibleList = [];

    const dayMap = {
      "1": "일",
      "2": "월",
      "3": "화",
      "4": "수",
      "5": "목",
      "6": "금",
      "7": "토",
    };

    for (let [key, value] of Object.entries(prayerData.stats)) {
      if (dayMap[key as keyof typeof dayMap]) {
        prayerList.push({
          day: dayMap[key as keyof typeof dayMap],
          minutes: value as number,
        });
      } 
    }

    for (let [key, value] of Object.entries(bibleData.stats)) {
      if (dayMap[key as keyof typeof dayMap]) {
        const passages = value as {
          start: number;
          end: number;
          chapter: string;
        }[];

        const books: string[] = [];
        let chapters = 0;

        for (const passage of passages) {
          const { start, end, chapter } = passage;
          if (start === end) {
            books.push(`${chapter} ${start}장`);
            chapters += 1;
          } else {
            books.push(`${chapter} ${start}-${end}장`);
            chapters += end - start + 1;
          }
        }

        bibleList.push({
          day: dayMap[key as keyof typeof dayMap],
          chapters,
          books,
        });
      }
    }

    setWeeklyBibleData(bibleList);
    setWeeklyPrayerData(prayerList);
  }

  useEffect(() => {
    if (!isLoggedIn() && !bypass) {
      setShowLoginDialog(true);
    } else {
      getDetailData();
    }
    
  }, [bypass]);

  const handleCloseDialog = () => {
    setShowLoginDialog(false);
    if (!isLoggedIn() && !bypass) {
      router.push("/");
    }
  };

  const getBarHeight = (value: number, maxValue: number) => {
    if (maxValue === 0) return 0;
    const percentage = (value / maxValue) * 100;
    return Math.max(percentage, 10); // 최소 10% 높이 보장
  };

  const maxChapters = Math.max(...weeklyBibleData.map((d) => d.chapters));
  const maxMinutes = Math.max(...weeklyPrayerData.map((d) => d.minutes));

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto">
      <MobileHeader title="통계" />

      <LoginRequiredStatsDialog
        isOpen={showLoginDialog}
        onClose={handleCloseDialog}
      />

      <div className="flex-1 p-3 pb-20">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-medium">{currentWeek}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-blue-50">
            <CardContent className="p-3 flex flex-col items-center">
              <BookOpen className="h-5 w-5 text-blue-500 mb-1" />
              <p className="text-xs text-muted-foreground">읽은 말씀</p>
              <p className="text-xl font-bold">{totalBibleChapters}장</p>
              <p className="text-xs text-muted-foreground">{bibleDays}/7일</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50">
            <CardContent className="p-3 flex flex-col items-center">
              <Clock className="h-5 w-5 text-purple-500 mb-1" />
              <p className="text-xs text-muted-foreground">기도 시간</p>
              <p className="text-xl font-bold">{totalPrayerMinutes}분</p>
              <p className="text-xs text-muted-foreground">{prayerDays}/7일</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bible" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="bible" className="text-xs">
              말씀 통계
            </TabsTrigger>
            <TabsTrigger value="prayer" className="text-xs">
              기도 통계
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bible">
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-base flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  주간 말씀 읽기
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex justify-between h-32 mb-1">
                  {weeklyBibleData.map((day, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-end w-full"
                    >
                      <div
                        className="w-6 bg-blue-200 rounded-t-sm"
                        style={{
                          height: `${getBarHeight(day.chapters, maxChapters)}%`,
                          backgroundColor:
                            day.chapters > 0
                              ? "rgb(191, 219, 254)"
                              : "rgb(226, 232, 240)",
                        }}
                      ></div>
                      <p className="text-xs mt-1">{day.day}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">읽은 성경</h4>
                  {weeklyBibleData.some((day) => day.books.length > 0) ? (
                    <div className="space-y-2">
                      {weeklyBibleData
                        .filter((day) => day.books.length > 0)
                        .map((day, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-8 text-xs text-muted-foreground">
                              {day.day}
                            </div>
                            <div className="text-xs flex-1">
                              {day.books.join(", ")}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      이번 주에 읽은 말씀이 없습니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prayer">
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-base flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  주간 기도 시간
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex justify-between h-32 mb-1">
                  {weeklyPrayerData.map((day, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-end w-full"
                    >
                      <div
                        className="w-6 bg-purple-200 rounded-t-sm"
                        style={{
                          height: `${getBarHeight(day.minutes, maxMinutes)}%`,
                          backgroundColor:
                            day.minutes > 0
                              ? "rgb(233, 213, 255)"
                              : "rgb(226, 232, 240)",
                        }}
                      ></div>
                      <p className="text-xs mt-1">{day.day}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">일별 기도 시간</h4>
                  {weeklyPrayerData.some((day) => day.minutes > 0) ? (
                    <div className="space-y-2">
                      {weeklyPrayerData
                        .filter((day) => day.minutes > 0)
                        .map((day, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-8 text-xs text-muted-foreground">
                              {day.day}
                            </div>
                            <div className="text-xs flex-1">
                              {day.minutes}분
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      이번 주에 기록된 기도 시간이 없습니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNavigation />
    </div>
  );
}
