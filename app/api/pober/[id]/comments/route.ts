import { type NextRequest, NextResponse } from "next/server"
import { apiCall } from "@/lib/utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = await params.id
    
    // 백엔드 API 호출 - 댓글은 개별 Pober 조회 시 함께 오는 것 같음
    const data = await apiCall(`/pober/${id}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('댓글 조회 API 에러:', error)
    return NextResponse.json(
      { error: '댓글을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = await params.id
    const body = await request.json()
    
    // 백엔드 API 호출
    const data = await apiCall('/pober-comment', {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        poberId: parseInt(id)
      }),
    })
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('댓글 작성 API 에러:', error)
    return NextResponse.json(
      { error: '댓글 작성에 실패했습니다' },
      { status: 500 }
    )
  }
}
