"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { PoberList, PoberEntry } from "@/components/pober-list"
import { PlusIcon } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { baseUrl, getTokenFromLocalStorage, isLoggedIn } from "@/lib/utils"

export default function Home() {
  const [entries, setEntries] = useState<PoberEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEntries, setTotalEntries] = useState(0)
  const [searchType, setSearchType] = useState<"person" | "date">("person")
  const [personQuery, setPersonQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)


  console.log(entries);

  // API 호출 함수
  const fetchEntries = async (page: number, name?: string, startDate?: string, endDate?: string) => {
    setLoading(true)
    setError(null)
    try {
      let url = `${baseUrl}/pober`;
      const params: string[] = [];
      if (searchType === "person" && name) params.push(`name=${encodeURIComponent(name)}`)
      if (searchType === "date" && startDate) params.push(`startDate=${encodeURIComponent(startDate)}`)
      if (searchType === "date" && endDate) params.push(`endDate=${encodeURIComponent(endDate)}`)
      params.push(`page=${page}`)
      params.push(`size=5`)
      if (params.length > 0) url += `?${params.join("&")}`
      let response = await fetch(url)
      if (isLoggedIn()) {
        const token = getTokenFromLocalStorage();
        response = await fetch(url, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
      } else {
        response = await fetch(url)
      }
      // if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다")
      const data = await response.json()
      // data가 배열이거나, content 필드에 배열이 있거나, entries 필드에 배열이 있을 수 있음
      const resultEntries = Array.isArray(data) ? data : data.content || data.entries || []
      setEntries(page > 1 ? (prev) => [...prev, ...resultEntries] : resultEntries)
      setTotalEntries(data.totalElements || data.totalEntries || resultEntries.length)
      setTotalPages(data.totalPages || 1)
    } catch (e: any) {
      setError(e.message || "알 수 없는 오류")
    } finally {
      setLoading(false)
      setPageLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    fetchEntries(1, personQuery, startDate, endDate)
    setSearchPerformed(!!(personQuery || startDate || endDate))
    // eslint-disable-next-line
  }, [searchType])

  // 무한 스크롤 (IntersectionObserver)
  useEffect(() => {
    if (!loadMoreRef.current || loading || pageLoading || currentPage >= totalPages) return
    const observer = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPageLoading(true)
        fetchEntries(currentPage + 1, personQuery, startDate, endDate)
        setCurrentPage((prev) => prev + 1)
      }
    }, { threshold: 1.0 })
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
    // eslint-disable-next-line
  }, [loadMoreRef.current, loading, pageLoading, currentPage, totalPages])

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto bg-slate-50">
      <MobileHeader title="POBER" hasNotification={true} />
      <div className="flex-1 p-4 pb-20">
        <SearchBar
          className="mb-4"
          onSearch={() => {
            setCurrentPage(1);
            fetchEntries(1, personQuery, startDate, endDate);
          }}
          onSearchParamsChange={(
            type: "person" | "date",
            query: string,
            start: string,
            end: string
          ) => {
            setSearchType(type);
            setPersonQuery(query);
            setStartDate(start);
            setEndDate(end);
          }}
          searchType={searchType}
          setSearchType={setSearchType}
          personQuery={personQuery}
          setPersonQuery={setPersonQuery}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        {loading && (
          <div className="p-8 text-center text-gray-400">로딩 중...</div>
        )}
        {error && <div className="p-8 text-center text-red-500">{error}</div>}
        {!loading && <PoberList entries={entries} />}
        {/* 무한 스크롤 로딩 표시기 */}
        {pageLoading && (
          <div className="flex justify-center items-center py-6 mt-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground mt-2">
              더 불러오는 중...
            </p>
          </div>
        )}
        {/* 무한 스크롤 트리거 */}
        <div ref={loadMoreRef}></div>
        <Link href="/write">
          <Button
            className="h-14 w-14 rounded-full fixed bottom-20 right-4 shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90"
            size="icon"
          >
            <PlusIcon className="!w-10 !h-10" />
          </Button>
        </Link>
      </div>
      <MobileNavigation />
    </div>
  );
}
