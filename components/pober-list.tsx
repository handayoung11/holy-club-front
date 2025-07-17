"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, BookMarked, X, Quote, ChevronRight, Heart, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { baseUrl } from "@/lib/utils"

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
  comments?: number;
  likes?: number;
  mediaPic?: string[];
}

export interface PoberListProps {
  date?: string
  entries?: PoberEntry[]
  limit?: number
  showPagination?: boolean
  totalEntries?: number
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => Promise<any>
}

export function PoberList({
  date,
  entries,
  limit = 5,
  showPagination = true,
  totalEntries: propsTotalEntries,
  totalPages: propsTotalPages,
  currentPage: propsCurrentPage,
  onPageChange,
}: PoberListProps) {
  const [poberEntries, setPoberEntries] = useState<PoberEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEntries, setTotalEntries] = useState(0)
  const [pageLoading, setPageLoading] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({})

  const loadMoreRef = useRef(null)

  console.log('pober-list-entries', poberEntries);

  const handleLike = (e: React.MouseEvent, postId: number) => {
    e.preventDefault() // 링크 이동 방지
    e.stopPropagation() // 이벤트 버블링 방지

    setLikedPosts((prev) => {
      const newState = { ...prev }
      newState[postId] = !prev[postId]
      return newState
    })

    // 실제 구현에서는 여기서 API 호출을 통해 서버에 좋아요 상태 업데이트
    console.log(`Post ${postId} like toggled`)
  }

  // 무한 스크롤 설정
  useEffect(() => {
    if (!showPagination || currentPage >= totalPages) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !pageLoading) {
          handlePageChange(currentPage + 1)
        }
      },
      { threshold: 1.0 },
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [currentPage, totalPages, pageLoading, showPagination])

  // useEffect 함수 내에서 날짜 필터링 로직 수정
  useEffect(() => {
    // 만약 entries prop이 제공되면 API 호출 없이 바로 사용
    if (entries) {
      // 백엔드에서 이미 정렬된 데이터를 받아오므로 추가 정렬 없이 사용
      setPoberEntries(entries)
      setTotalEntries(propsTotalEntries || entries.length)
      setTotalPages(propsTotalPages || Math.ceil(entries.length / limit))
      setCurrentPage(propsCurrentPage || 1)
      if (!pageLoading) setLoading(false)
      return
    }

    // 그렇지 않으면 API 호출
    async function fetchPoberEntries() {
      try {
        setLoading(true)
        // date가 제공되면 날짜 범위 검색, 아니면 모든 항목 가져오기
        let url = `${baseUrl}/pober`

        if (date) {
          // 단일 날짜 검색 대신 날짜 범위 검색 사용
          const yesterday = new Date(date)
          const today = new Date(date)
          today.setDate(today.getDate() + 1)

          const startDateStr = date
          const endDateStr = today.toISOString().split("T")[0]

          url = `${url}?startDate=${startDateStr}&endDate=${endDateStr}`
        }

        // 페이지 정보 추가
        url = `${url}${url.includes("?") ? "&" : "?"}page=${currentPage}&size=${limit}`

        const response = await fetch(url)

        
        if (!response.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다")
        }
        
        const data = await response.json()
        console.log('pober-list-response-data', data);

        // 백엔드 응답 구조에 맞게 수정
        const entries = data;
        
        // undefined나 null인 경우만 처리
        if (!Array.isArray(entries)) {
          setPoberEntries([])
          setTotalEntries(0)
          setTotalPages(1)
          setLoading(false)
          return
        }

        console.log('pober-list-entries', entries);
        
        // 페이지가 1보다 크면 기존 데이터에 새 데이터 추가
        if (currentPage > 1) {
          setPoberEntries((prev) => [...prev, ...entries])
        } else {
          setPoberEntries(entries)
        }

        setTotalEntries(data.totalElements || data.totalEntries || entries.length)
        setTotalPages(data.totalPages || Math.ceil(entries.length / limit))
      } catch (err) {
        console.error("Error fetching pober entries:", err)
        setError("데이터를 불러오는데 문제가 발생했습니다")
      } finally {
        setLoading(false)
      }
    }

    fetchPoberEntries()
  }, [date, entries, currentPage, limit, propsTotalEntries, propsTotalPages, propsCurrentPage])

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage > currentPage) {
      // 페이지 변경 시 로딩 상태 활성화
      setPageLoading(true)

      // 외부에서 페이지 변경을 처리하는 콜백이 있으면 호출
      if (onPageChange) {
        onPageChange(newPage)
          .then((data: any) => {
            // 기존 데이터에 새 데이터 추가 (무한 스크롤)
            const entries = data.content || data.entries || data || []
            setPoberEntries((prev) => [...prev, ...entries])
            setPageLoading(false)
          })
          .catch(() => {
            setPageLoading(false)
            setLoading(false)
            setPageLoading(false)
          })
      } else {
        // 내부 상태로 페이지 변경 처리
        setCurrentPage(newPage)
        setPageLoading(false)
      }
    }
  }

  // 기도 시간이 0분인지 확인하는 함수
  const isPrayerZero = (prayer: string) => {
    return !prayer || prayer === "0분" || prayer === "0시간" || prayer === "0"
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border-none shadow-sm rounded-xl mb-3">
            <CardContent className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-16 w-full mb-3" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-md">
          다시 시도
        </button>
      </div>
    )
  }

  if (poberEntries.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">해당 날짜에 작성된 POBER가 없습니다.</p>
      </div>
    )
  }

  // 현재 페이지에 표시할 항목들
  const startIndex = 0
  const endIndex = limit
  const currentEntries = entries ? poberEntries : poberEntries

  return (
    <div className="space-y-4">
      <div className="space-y-8">
        {currentEntries.map((entry) => (
          <Link href={`/pober/${entry.id}`} key={entry.id}>
            <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl mb-3 relative">
              <CardContent className="px-5 pt-5 pb-3 bg-gradient-to-br from-white to-slate-50">
                {/* 우측 상단 화살표 아이콘 */}
                <div className="absolute top-3 right-3 text-gray-300">
                  <ChevronRight className="h-7 w-7" />
                </div>
                {/* 헤더 영역: 사용자 정보 및 날짜 */}
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
                      <div>{/* 좋아요 버튼 제거 */}</div>
                    </div>
                  </div>
                </div>

                {/* 한줄 소감 */}
                {/* {entry.thought && ( */}
                {entry.memo && (
                  <div className="mb-3 px-2 py-2 bg-gray-50 rounded-lg border border-gray-100 italic text-sm text-gray-600">
                    <div className="flex items-start">
                      <Quote className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-gray-400" />
                      <p className="line-clamp-2">{entry.memo}</p>
                    </div>
                  </div>
                )}

                {/* 콘텐츠 영역: 기도와 말씀을 한 줄에 반씩 표시 */}
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
                            기도 <span className="ml-1 text-purple-400">(P)</span>
                          </p>
                          <p className="text-sm leading-relaxed line-clamp-2 text-slate-700">{entry.prayer}</p>
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
                  {entry.bibles ? (
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-3 rounded-lg border border-blue-100/30 shadow-sm">
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-100 rounded-full p-1.5 flex-shrink-0">
                          <BookMarked className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-600 mb-1 flex items-center">
                            말씀 <span className="ml-1 text-blue-400">(B)</span>
                          </p>
                          <p className="text-sm leading-relaxed line-clamp-2 text-slate-700">{entry.bibles[0].chapter + " " + entry.bibles[0].start + "장 ~ " + entry.bibles[0].end + "장"}</p>
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

                {/* 좋아요 버튼과 댓글 개수 추가 */}
                <div className="flex justify-end mt-3 space-x-1">
                  <button
                    onClick={(e) => handleLike(e, entry.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                  >
                    <Heart className={`h-5 w-5 ${likedPosts[entry.id] ? "fill-red-500 text-red-500" : ""}`} />
                    <span className={`text-sm font-medium ${likedPosts[entry.id] ? "text-red-500" : ""}`}>
                      {likedPosts[entry.id] ? (entry.likes || 0) + 1 : entry.likes || 0}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-500">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm font-medium">{entry.comments || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 무한 스크롤 로딩 표시기 */}
      {showPagination && currentPage < totalPages && (
        <div ref={loadMoreRef} className="flex justify-center items-center py-6 mt-2">
          {pageLoading ? (
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground mt-2">더 불러오는 중...</p>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || pageLoading}
            >
              더 보기 ({currentPage}/{totalPages})
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
