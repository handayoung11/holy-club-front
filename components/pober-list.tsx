"use client"

import { Button } from "@/components/ui/button"
import { baseUrl } from "@/lib/utils"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Quote, ChevronRight, BookMarked, X, Heart, MessageSquare } from "lucide-react"
import { fetchWithAuthRetry } from "@/Auth/fetchWrapper"
import HeartToggle from "./ui/heart"

export interface Bible {
  chapter: string;
  end: number;
  id: number;
  start: number;
}

export interface PoberEntry {
  id: number;
  user: {
    name: string;
    avatar?: string;
  };
  date: string;
  thought?: string;
  memo?: string; // 백엔드 필드명
  prayer: string;
  bibles: Bible[];
  exercise?: string;
  exer?: string; // 백엔드 필드명
  reading?: string;
  obd?: string; // 백엔드 필드명
  media?: number;
  commentCount?: number;
  likeCount?: number;
  liked?: boolean;
  mediaPic?: string[];
}

export interface PoberListProps {
  entries?: PoberEntry[];
}

function isPrayerZero(prayer: string) {
  return !prayer || prayer === "0분" || prayer === "0시간" || prayer === "0";
}

export function PoberList({ entries = [] }: PoberListProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">해당 날짜에 작성된 POWER가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-8">
        {entries.map((entry) => (
          <Link href={`/pober/${entry.id}`} key={entry.id}>
            <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl mb-3 relative">
              <CardContent className="px-5 pt-5 pb-3 bg-gradient-to-br from-white to-slate-50">
                <div className="absolute top-3 right-3 text-gray-300">
                  <ChevronRight className="h-7 w-7" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage
                      src={entry.user.avatar || "/placeholder.svg"}
                      alt={`${entry.user.name}의 프로필 이미지`}
                    />
                    <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{entry.user.name}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1 inline" />
                          {entry.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {entry.memo && (
                  <div className="mb-3 px-2 py-2 bg-gray-50 rounded-lg border border-gray-100 italic text-sm text-gray-600">
                    <div className="flex items-start">
                      <Quote className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-gray-400" />
                      <p className="line-clamp-2">{entry.memo}</p>
                    </div>
                  </div>
                )}
                {/* 기도/말씀/운동/독서/좋아요/댓글 Dumb 렌더링 */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* 기도 항목 - 0분이면 X 아이콘 표시 */}
                  {!isPrayerZero(entry.prayer) ? (
                    <div className="bg-gradient-to-br from-purple-50 to-slate-50 p-3 rounded-lg border border-purple-100/30 shadow-sm">
                      <div className="flex items-start gap-2">
                        <div className="bg-purple-100 rounded-full p-1.5 flex-shrink-0">
                          <Clock className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-purple-600 mb-1 flex items-center">
                            기도{" "}
                            <span className="ml-1 text-purple-400">(P)</span>
                          </p>
                          <p className="text-sm leading-relaxed line-clamp-2 text-slate-700">
                            {entry.prayer}분
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-purple-50 to-slate-50 p-3 rounded-lg border border-purple-100/30 shadow-sm flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                  )}
                  {/* 말씀 항목 - 있으면 내용 표시, 없으면 X 아이콘만 표시 */}
                  {entry.bibles && entry.bibles.length > 0 ? (
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-3 rounded-lg border border-blue-100/30 shadow-sm">
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-100 rounded-full p-1.5 flex-shrink-0">
                          <BookMarked className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-600 mb-1 flex items-center">
                            말씀 <span className="ml-1 text-blue-400">(W)</span>
                          </p>
                          <p className="text-sm leading-relaxed line-clamp-2 text-slate-700">
                            {entry.bibles[0].chapter +
                              " " +
                              entry.bibles[0].start +
                              "장 ~ " +
                              entry.bibles[0].end +
                              "장"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-3 rounded-lg border border-blue-100/30 shadow-sm flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                  )}
                </div>
                {/* 운동/독서/좋아요/댓글 Dumb 렌더링 */}
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                  {entry.exercise && <span>운동: {entry.exercise}</span>}
                  {entry.reading && <span>독서: {entry.reading}</span>}
                  {entry.obd && <span>순종: {entry.obd}</span>}
                  {entry.media !== undefined && (
                    <span>미디어: {entry.media}분</span>
                  )}
                </div>
                <div className="flex justify-end mt-3 space-x-1">
                  <HeartToggle id={entry.id} likeCount={entry.likeCount} liked={entry.liked} />
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-500">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {entry.commentCount || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
