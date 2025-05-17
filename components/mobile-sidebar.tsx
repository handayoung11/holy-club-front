import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, BarChart, Settings, LogIn, PenSquare } from "lucide-react"

export function MobileSidebar() {
  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Holy Club</h2>
        <div className="space-y-1">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start h-12 text-base">
              <Home className="mr-2 h-5 w-5" />홈
            </Button>
          </Link>
          <Link href="/write">
            <Button variant="ghost" className="w-full justify-start h-12 text-base">
              <PenSquare className="mr-2 h-5 w-5" />
              기록하기
            </Button>
          </Link>
          <Link href="/stats">
            <Button variant="ghost" className="w-full justify-start h-12 text-base">
              <BarChart className="mr-2 h-5 w-5" />
              통계
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start h-12 text-base">
              <Settings className="mr-2 h-5 w-5" />
              설정
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-auto px-3 py-2">
        <Link href="/login">
          <Button variant="outline" className="w-full justify-start h-12 text-base">
            <LogIn className="mr-2 h-5 w-5" />
            로그인
          </Button>
        </Link>
      </div>
    </div>
  )
}
