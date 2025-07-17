import { type NextRequest, NextResponse } from "next/server"
import { apiCall } from "@/lib/utils"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = await params.id
    
    // 백엔드 API 호출
    const data = await apiCall(`/pober/like/${id}`, {
      method: 'POST',
    })
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('좋아요 API 에러:', error)
    return NextResponse.json(
      { error: '좋아요 처리에 실패했습니다' },
      { status: 500 }
    )
  }
} 