"use client"

import { useState } from "react"
import { Search, Calendar, User, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  onSearch?: (results: any[], pagination?: { totalEntries: number; totalPages: number; currentPage: number }) => void
  onSearchParamsChange?: (type: "person" | "date", personQuery: string, startDate: string, endDate: string) => void
}

export function SearchBar({ className, onSearch, onSearchParamsChange }: SearchBarProps) {
  const [searchType, setSearchType] = useState<"person" | "date">("person")
  const [personQuery, setPersonQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!startDate && !endDate && !personQuery.trim()) {
        onSearch([], null, true)
        return
      }

      if (searchType === "person") {
        // API 호출
        const response = await fetch(`/api/pober?nickname=${encodeURIComponent(personQuery.trim())}`)

        if (!response.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다")
        }

        const data = await response.json()

        // 검색 결과를 상위 컴포넌트에 전달 (페이징 정보 포함)
        if (onSearch) {
          onSearch(data.entries, {
            totalEntries: data.totalEntries || data.entries.length,
            totalPages: data.totalPages || Math.ceil(data.entries.length / 5),
            currentPage: data.currentPage || 1,
          })
        }
      } else {
        // 날짜 범위 검색 로직 구현
        const effectiveStartDate = startDate
        const effectiveEndDate = endDate

        // 시작 날짜와 종료 날짜가 유효한지 확인
        const start = new Date(effectiveStartDate)
        const end = new Date(effectiveEndDate)

        if (start > end) {
          setError("종료 날짜는 시작 날짜보다 뒤여야 합니다.")
          return
        }

        // API 호출
        const response = await fetch(`/api/pober?startDate=${effectiveStartDate}&endDate=${effectiveEndDate}`)

        if (!response.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다")
        }

        const data = await response.json()

        // 검색 결과를 상위 컴포넌트에 전달 (페이징 정보 포함)
        if (onSearch) {
          onSearch(data.entries, {
            totalEntries: data.totalEntries || data.entries.length,
            totalPages: data.totalPages || Math.ceil(data.entries.length / 5),
            currentPage: data.currentPage || 1,
          })
        }
      }
    } catch (err) {
      console.error("Error searching:", err)
      setError(err instanceof Error ? err.message : "검색 중 오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-2">
        <button
          onClick={() => {
            const newType = searchType === "person" ? "date" : "person"
            setSearchType(newType)
            if (onSearchParamsChange) {
              onSearchParamsChange(newType, personQuery, startDate, endDate)
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          {searchType === "person" ? (
            <>
              <User className="h-4 w-4" />
              <ChevronDown className="h-4 w-4" />
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {searchType === "person" ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={personQuery}
              onChange={(e) => {
                setPersonQuery(e.target.value)
                if (onSearchParamsChange) {
                  onSearchParamsChange(searchType, e.target.value, startDate, endDate)
                }
              }}
              placeholder="닉네임으로 검색하세요"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-none shadow-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="py-3 px-6 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            {loading ? "검색 중..." : "검색"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (onSearchParamsChange) {
                    onSearchParamsChange(searchType, personQuery, e.target.value, endDate)
                  }
                }}
                placeholder="시작 날짜"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-none shadow-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  if (onSearchParamsChange) {
                    onSearchParamsChange(searchType, personQuery, startDate, e.target.value)
                  }
                }}
                placeholder="종료 날짜 (선택사항)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-none shadow-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-3 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {loading ? "검색 중..." : "검색"}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
