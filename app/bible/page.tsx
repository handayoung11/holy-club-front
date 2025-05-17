"use client"

import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Button } from "@/components/ui/button"

export default function BiblePage() {
  const router = useRouter()
  const chapters = Array.from({ length: 44 }, (_, i) => i + 1)

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto bg-slate-50">
      <MobileHeader title="창세기" showBackButton onBack={handleBack} />

      <div className="flex-1 p-4 pb-20">
        <div className="grid grid-cols-5 gap-2">
          {chapters.map((chapter) => (
            <Button
              key={chapter}
              variant="outline"
              className="h-12 w-full rounded-lg bg-white hover:bg-primary/10 hover:text-primary"
            >
              {chapter}
            </Button>
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  )
}
