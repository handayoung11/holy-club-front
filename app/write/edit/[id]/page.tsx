"use client"

import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { PoberWriteForm } from "@/components/pober-write-form"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { baseUrl } from "@/lib/utils"

export default function EditPoberPage({ params }: { params: { id: string } }) {

  const [poberEntry, setPoberEntry] = useState({});
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
    getDetailData();
  }, [])

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto bg-slate-50">
      <MobileHeader title="POWER 수정" showBackButton onBack={handleBack} />

      <div className="flex-1 p-4 pb-20">
        <PoberWriteForm isEditing={true} initialData={poberEntry} />
      </div>

      <MobileNavigation />
    </div>
  )
}
