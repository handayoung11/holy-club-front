"use client"

import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { PoberWriteForm } from "@/components/pober-write-form"

export default function WritePage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto bg-slate-50">
      <MobileHeader title="POWER 작성" showBackButton onBack={handleBack} />

      <div className="flex-1 p-4 pb-20">
        <PoberWriteForm />
      </div>

      <MobileNavigation />
    </div>
  )
}
