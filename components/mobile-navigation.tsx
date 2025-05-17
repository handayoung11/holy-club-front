"use client"

import Link from "next/link"
import { BookOpenIcon, UserIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t shadow-sm">
      <div className="max-w-md mx-auto">
        <nav className="flex justify-around">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center py-3 flex-1",
              pathname === "/" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <BookOpenIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Pober</span>
          </Link>
          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center py-3 flex-1",
              pathname === "/profile" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <UserIcon className="h-6 w-6" />
            <span className="text-xs mt-1">MyPage</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
