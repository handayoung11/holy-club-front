"use client"

import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { PoberWriteForm } from "@/components/pober-write-form"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { baseUrl } from "@/lib/utils"

export default function EditPoberPage({ params }: { params: { id: string } }) {

  const [poberEntry, setPoberEntry] = useState({
    id: 1,
    user: {
      name: "홍길동",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-20",
    prayer: "1시간",
    obedience: "토요 청년지성소 예배, 청년지저스아미 회의 참석",
    bible: "요한계시록 1~12장, 출애굽기 5~8장",
    exercise: "친구와 복음에 대해 대화",
    reading: "가족과 시간을 보냄",
    mediaTime: 2.5,
    images: [
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
    ],
    comments: 3,
  });
  const router = useRouter()
  const { toast } = useToast()

  const getDetailData = async () => {
    const { id } = await params;
    let url = `${baseUrl}/pober/${id}`;
    const response = await fetch(url);

    
    const data = await response.json();
    
    setPoberEntry(data);    
  }

  useEffect(() => {
    // 실제 구현에서는 API 호출로 데이터 가져오기
    // toast({
    //   title: "수정 모드",
    //   description: "POBER 기록을 수정합니다.",
    // })

    getDetailData();

  }, [])

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto bg-slate-50">
      <MobileHeader title="POBER 수정" showBackButton onBack={handleBack} />

      <div className="flex-1 p-4 pb-20">
        <PoberWriteForm isEditing={true} initialData={poberEntry} />
      </div>

      <MobileNavigation />
    </div>
  )
}
