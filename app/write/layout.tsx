"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginRequiredDialog } from "@/components/login-required-dialog"

// 쿠키에서 토큰을 확인하는 함수
const getTokenFromCookie = () => {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('token=')
  )
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1]
  }
  
  return null
}

// 로그인 상태를 확인하는 함수
const isLoggedIn = () => {
  const token = getTokenFromCookie()
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
