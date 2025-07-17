import { type NextRequest, NextResponse } from "next/server"
import { apiCall } from "@/lib/utils"

// 샘플 데이터 - 실제로는 데이터베이스에서 가져올 것입니다
// 메인 데이터 배열에 접근하기 위해 외부 파일로 분리하거나 실제 DB를 사용해야 합니다
// 여기서는 간단한 예시를 위해 직접 정의합니다
const poberEntries = [
  {
    id: 1,
    user: {
      name: "홍길동",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-29",
    thought: "오늘은 말씀을 통해 많은 은혜를 받은 하루였다.",
    prayer: "1시간",
    obedience: "토요 청년지성소 예배, 청년지저스아미 회의 참석",
    bible: "요한계시록 1~12장, 출애굽기 5~8장",
    exercise: "친구와 복음에 대해 대화",
    reading: "가족과 시간을 보냄",
    mediaTime: 2.5,
    images: ["/placeholder.svg?height=300&width=300", "/placeholder.svg?height=300&width=300"],
    comments: 3,
    likes: 5,
  },
  {
    id: 2,
    user: {
      name: "김화평",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-29",
    thought: "운동을 열심히 한 보람찬 하루.",
    prayer: "0분",
    obedience: "새벽 예배 참석",
    bible: "",
    exercise: "1시간 헬스장",
    reading: "신약개론 5장",
    mediaTime: 1.5,
    images: ["/placeholder.svg?height=300&width=300"],
    comments: 0,
    likes: 2,
  },
  {
    id: 3,
    user: {
      name: "이영희",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-28",
    thought: "독서를 통해 새로운 지식을 얻은 날.",
    prayer: "1시간",
    obedience: "주일 예배 참석",
    bible: "마태복음 5-7장",
    exercise: "요가 30분",
    reading: "기독교 고전 읽기",
    mediaTime: 3.0,
    images: ["/placeholder.svg?height=300&width=300"],
    comments: 2,
    likes: 8,
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = await params.id
    
    // 백엔드 API 호출
    const data = await apiCall(`/pober/${id}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Pober 상세 API 에러:', error)
    return NextResponse.json(
      { error: '데이터를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// PUT 메서드 - POBER 수정
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = await params.id
    const body = await request.json()
    
    // 백엔드 API 호출
    const data = await apiCall(`/pober/${id}`, {
      method: 'PATCH', // 백엔드는 PATCH를 사용
      body: JSON.stringify(body),
    })
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Pober 수정 API 에러:', error)
    return NextResponse.json(
      { error: '글 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE 메서드 - POBER 삭제
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = await params.id
    
    // 백엔드 API 호출
    const data = await apiCall(`/pober/${id}`, {
      method: 'DELETE',
    })
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Pober 삭제 API 에러:', error)
    return NextResponse.json(
      { error: '글 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
