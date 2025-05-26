"use client"

import { useState } from "react"
import { BellIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface NotificationPopoverProps {
  hasNewNotification?: boolean
  buttonSize?: "default" | "large"
}

export function NotificationPopover({ hasNewNotification = false, buttonSize = "default" }: NotificationPopoverProps) {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${buttonSize === "large" ? "h-12 w-12" : ""}`}>
          <BellIcon className={`${buttonSize === "large" ? "!h-6 !w-6" : "h-5 w-5"}`} />
          {hasNewNotification && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>}
          <span className="sr-only">알림</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">알림</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 bg-background">
          <div className="mb-4">
            <div className="py-3 px-4 rounded-lg bg-primary/5 mb-2 border-l-2 border-primary">
              <p className="text-sm">내 POBER에 댓글이 달렸습니다</p>
              <p className="text-xs text-muted-foreground mt-1">5분 전</p>
            </div>
            <div className="py-3 px-4 rounded-lg bg-primary/5 border-l-2 border-primary">
              <p className="text-sm">내 댓글에 답글이 달렸습니다.</p>
              <p className="text-xs text-muted-foreground mt-1">10분 전</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-2">이미 확인한 알람입니다</p>
            <div className="py-3 px-4 rounded-lg bg-slate-100 mb-2">
              <p className="text-sm text-muted-foreground">홍길동님이 내 POBER에 댓글을 달았습니다</p>
              <p className="text-xs text-muted-foreground mt-1">어제</p>
            </div>
            <div className="py-3 px-4 rounded-lg bg-slate-100">
              <p className="text-sm text-muted-foreground">김철수님이 내 댓글에 답글을 달았습니다</p>
              <p className="text-xs text-muted-foreground mt-1">2일 전</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
