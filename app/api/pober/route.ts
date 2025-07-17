import { type NextRequest, NextResponse } from "next/server"
import { apiCall } from "@/lib/utils"

// GET 함수 - 백엔드 API 호출
export async function GET(request: NextRequest) {
  try {
    // URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const name = searchParams.get("name")
    const page = searchParams.get("page") || "1"
    const size = searchParams.get("limit") || "5" // 프론트엔드는 limit을 사용하지만 백엔드는 size를 사용

    // 백엔드 API 호출을 위한 파라미터 구성
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (name) params.append('name', name)
    params.append('page', page)
    params.append('size', size)

    // 백엔드 API 호출
    const endpoint = `/pober?${params.toString()}`
    const data = await apiCall(endpoint)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Pober API 에러:', error)
    return NextResponse.json(
      { error: '데이터를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// POST 함수 - 새로운 Pober 작성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 쿠키에서 토큰 추출
    const token = request.cookies.get('token')?.value
    
    // 백엔드 API 호출 시 토큰을 Authorization 헤더에 포함
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // 백엔드 API 호출
    const data = await apiCall('/pober', {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Pober 작성 API 에러:', error)
    return NextResponse.json(
      { error: '글 작성에 실패했습니다' },
      { status: 500 }
    )
  }
}
