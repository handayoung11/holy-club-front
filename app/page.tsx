"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { PoberList } from "@/components/pober-list"
import { PlusIcon } from "lucide-react"
import { SearchBar } from "@/components/search-bar"

export default function Home() {
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [searchPagination, setSearchPagination] = useState<{
    totalEntries: number
    totalPages: number
    currentPage: number
  } | null>(null)
  const [currentSearchPage, setCurrentSearchPage] = useState(1)
  const [searchType, setSearchType] = useState<"person" | "date" | null>("person")
  const [personQuery, setPersonQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [pageLoading, setPageLoading] = useState(false)

  const handleSearch = (
    results: any[],
    pagination?: { totalEntries: number; totalPages: number; currentPage: number },
    noInput = false,
  ) => {
    setSearchResults(results)
    setSearchPerformed(!noInput)
    setSearchPagination(pagination || null)
    setCurrentSearchPage(1) // 검색 시 페이지를 1로 초기화
  }

  const handleSearchPageChange = async (page: number) => {
    setCurrentSearchPage(page)

    // 스크롤을 맨 위로 이동하지 않음 - 무한 스크롤에서는 필요 없음
    // window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      setPageLoading(true)
      // 현재 검색 조건으로 새 페이지 데이터 요청
      let url = `/api/pober?page=${page}&limit=5`

      // 검색 조건에 따라 URL 파라미터 추가
      if (searchType === "person" && personQuery) {
        url += `&nickname=${encodeURIComponent(personQuery)}`
      } else if (searchType === "date") {
        if (startDate) url += `&startDate=${startDate}`
        if (endDate) url += `&endDate=${endDate}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error("페이지 데이터를 불러오는데 실패했습니다")

      const data = await response.json()

      // 페이지가 1보다 크면 기존 데이터에 새 데이터 추가
      if (page > 1) {
        setSearchResults((prev) => [...prev, ...data.entries])
      } else {
        setSearchResults(data.entries)
      }

      setSearchPagination({
        totalEntries: data.totalEntries,
        totalPages: data.totalPages,
        currentPage: page,
      })
      setPageLoading(false)
      return data // Promise 반환
    } catch (error) {
      console.error("Error fetching search page:", error)
      setPageLoading(false)
      throw error // 에러를 다시 throw하여 Promise가 reject되도록 함
    }
  }

  const handleSearchParamsChange = (type: "person" | "date", query: string, start: string, end: string) => {
    setSearchType(type)
    setPersonQuery(query)
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto bg-slate-50">
      <MobileHeader title="POBER" hasNotification={true} />

      <div className="flex-1 p-4 pb-20">
        <SearchBar
          className="mb-4"
          onSearch={handleSearch}
          onSearchParamsChange={handleSearchParamsChange}
          onSearchTypeChange={(type) => setSearchType(type)}
          onPersonQueryChange={(query) => setPersonQuery(query)}
          onStartDateChange={(date) => setStartDate(date)}
          onEndDateChange={(date) => setEndDate(date)}
        />

        {searchPerformed ? (
          <div>
            <h2 className="text-lg font-medium mb-3">
              검색 결과 ({searchPagination?.totalEntries || searchResults?.length || 0})
            </h2>
            {searchResults && searchResults.length > 0 ? (
              <PoberList
                entries={searchResults}
                limit={5}
                showPagination={true}
                totalEntries={searchPagination?.totalEntries}
                totalPages={searchPagination?.totalPages}
                currentPage={currentSearchPage}
                onPageChange={handleSearchPageChange}
              />
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <PoberList limit={5} showPagination={true} />
          </div>
        )}

        <Link href="/write?bypass=true">
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
  )
}
