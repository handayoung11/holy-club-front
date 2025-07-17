"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface LoginRequiredStatsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginRequiredStatsDialog({ isOpen, onClose }: LoginRequiredStatsDialogProps) {
  const router = useRouter()

  const handleLogin = () => {
    router.push("/login")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>로그인 필요</DialogTitle>
          <DialogDescription>로그인 후 확인이 가능해요 :) 로그인하러 가볼까요?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-full">
            취소
          </Button>
          <Button onClick={handleLogin} className="sm:w-full">
            로그인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
