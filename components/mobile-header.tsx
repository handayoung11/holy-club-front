"use client"

import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "./mobile-sidebar"
import { NotificationPopover } from "./notification-popover"

interface MobileHeaderProps {
  title: string
  hasNotification?: boolean
  showBackButton?: boolean
  onBack?: () => void
}

export function MobileHeader({ title, hasNotification = false, showBackButton = false, onBack }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-white border-b shadow-sm">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="flex items-center">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-12 w-12"
              onClick={() => {
                if (onBack) {
                  onBack()
                } else {
                  window.history.back()
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="sr-only">뒤로 가기</span>
            </Button>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 h-12 w-12">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <MobileSidebar />
              </SheetContent>
            </Sheet>
          )}
          <h1 className="text-lg font-bold">{title}</h1>
        </div>

        <NotificationPopover hasNewNotification={hasNotification} buttonSize="large" />
      </div>
    </header>
  )
}
