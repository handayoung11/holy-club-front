import { type NextRequest, NextResponse } from "next/server"

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
  // URL에서 id 파라미터 추출
  const id = Number.parseInt(params.id)

  // ID로 해당 Pober 항목 찾기
  const poberEntry = poberEntries.find((entry) => entry.id === id)

  // 항목이 없으면 404 반환
  if (!poberEntry) {
    return NextResponse.json({ error: "Pober not found" }, { status: 404 })
  }

  // 응답 지연 시뮬레이션 (실제 API 호출처럼 보이게)
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json({ entry: poberEntry })
}

// PUT 메서드 추가 - POBER 수정
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // URL에서 id 파라미터 추출
    const id = Number.parseInt(params.id)

    // 요청 본문에서 데이터 추출
    const updatedData = await request.json()

    // ID로 해당 Pober 항목 찾기
    const index = poberEntries.findIndex((entry) => entry.id === id)

    // 항목이 없으면 404 반환
    if (index === -1) {
      return NextResponse.json({ error: "Pober not found" }, { status: 404 })
    }

    // 기존 항목 가져오기
    const existingEntry = poberEntries[index]

    // 업데이트된 항목 생성 (기존 데이터 유지하면서 새 데이터로 업데이트)
    const updatedEntry = {
      ...existingEntry,
      date: updatedData.date || existingEntry.date,
      thought: updatedData.thought !== undefined ? updatedData.thought : existingEntry.thought,
      prayer: updatedData.prayer || existingEntry.prayer,
      obedience: updatedData.obedience !== undefined ? updatedData.obedience : existingEntry.obedience,
      bible: updatedData.bible !== undefined ? updatedData.bible : existingEntry.bible,
      exercise: updatedData.exercise !== undefined ? updatedData.exercise : existingEntry.exercise,
      reading: updatedData.reading !== undefined ? updatedData.reading : existingEntry.reading,
      mediaTime: updatedData.mediaTime !== undefined ? updatedData.mediaTime : existingEntry.mediaTime,
      images: updatedData.images || existingEntry.images,
      likes: existingEntry.likes, // 좋아요 수 유지
    }

    // 배열에서 항목 업데이트
    poberEntries[index] = updatedEntry

    // 응답 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ success: true, entry: updatedEntry })
  } catch (error) {
    console.error("Error updating POBER:", error)
    return NextResponse.json({ success: false, error: "POBER 수정 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// DELETE 메서드 추가 - POBER 삭제
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // URL에서 id 파라미터 추출
    const id = Number.parseInt(params.id)

    // ID로 해당 Pober 항목 찾기
    const index = poberEntries.findIndex((entry) => entry.id === id)

    // 항목이 없으면 404 반환
    if (index === -1) {
      return NextResponse.json({ error: "Pober not found" }, { status: 404 })
    }

    // 배열에서 항목 삭제
    poberEntries.splice(index, 1)

    // 응답 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ success: true, message: "POBER가 성공적으로 삭제되었습니다." })
  } catch (error) {
    console.error("Error deleting POBER:", error)
    return NextResponse.json({ success: false, error: "POBER 삭제 중 오류가 발생했습니다." }, { status: 500 })
  }
}
