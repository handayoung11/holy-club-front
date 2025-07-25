"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginRequiredDialog } from "@/components/login-required-dialog"
import { getTokenFromLocalStorage } from "@/lib/utils"

// 로그인 상태를 확인하는 함수
const isLoggedIn = () => {
  const token = getTokenFromLocalStorage();
  return token !== null && token !== ''
}

function WriteLayoutContent({ children }: { children: React.ReactNode }) {
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const bypass = searchParams.get("bypass") === "true"

  useEffect(() => {
    if (!isLoggedIn() && !bypass) {
      setShowLoginDialog(true)
    }
  }, [bypass])

  const handleCloseDialog = () => {
    setShowLoginDialog(false)
    if (!isLoggedIn() && !bypass) {
      router.push("/")
    }
  }

  return (
    <>
      {children}
      <LoginRequiredDialog isOpen={showLoginDialog} onClose={handleCloseDialog} />
    </>
  )
}

export default function WriteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WriteLayoutContent children={children} />
    </Suspense>
  )
}
