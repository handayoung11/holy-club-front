import { type NextRequest, NextResponse } from "next/server"

// 샘플 데이터 - 실제로는 데이터베이스에서 가져올 것입니다
const poberEntries = [
  {
    id: 1,
    user: {
      name: "홍길동",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-29", // 어제 날짜 예시
    thought: "오늘은 말씀을 통해 많은 은혜를 받은 하루였다.",
    prayer: "1시간",
    obedience: "토요 청년지성소 예배, 청년지저스아미 회의 참석",
    bible: "요한계시록 1-3장",
    exercise: "30분 조깅",
    reading: "창세기 해설서 10페이지",
    mediaTime: 2.5,
    images: ["/placeholder.svg?height=300&width=300"],
    comments: 3,
    likes: 5,
  },
  {
    id: 2,
    user: {
      name: "김화평",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-29", // 어제 날짜 예시
    thought: "운동을 열심히 한 보람찬 하루.",
    prayer: "0분",
    obedience: "새벽 예배 참석",
    bible: "",
    exercise: "1시간 헬스장",
    reading: "신약개론 5장",
    mediaTime: 1.5,
    images: [],
    comments: 0,
    likes: 2,
  },
  {
    id: 3,
    user: {
      name: "이영희",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-28", // 그저께 날짜 예시
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
  {
    id: 4,
    user: {
      name: "박민수",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-27",
    thought: "기도와 말씀으로 하루를 시작했다.",
    prayer: "30분",
    obedience: "수요 예배 참석",
    bible: "시편 1-5장",
    exercise: "20분 스트레칭",
    reading: "신앙 서적 한 챕터",
    mediaTime: 1.0,
    images: [],
    comments: 1,
    likes: 3,
  },
  {
    id: 5,
    user: {
      name: "최지원",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-26",
    thought: "말씀 묵상을 통해 깨달음을 얻은 날.",
    prayer: "2시간",
    obedience: "금요 기도회 참석",
    bible: "요한복음 1-3장",
    exercise: "40분 달리기",
    reading: "성경 주석 읽기",
    mediaTime: 0.5,
    images: ["/placeholder.svg?height=300&width=300"],
    comments: 4,
    likes: 12,
  },
  {
    id: 6,
    user: {
      name: "정다은",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-25",
    thought: "감사함으로 하루를 마무리했다.",
    prayer: "1시간 30분",
    obedience: "새벽 기도회 참석",
    bible: "로마서 8장",
    exercise: "1시간 자전거",
    reading: "신학 서적 읽기",
    mediaTime: 1.2,
    images: [],
    comments: 2,
    likes: 6,
  },
  {
    id: 7,
    user: {
      name: "김철수",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2025-04-24",
    thought: "하나님의 인도하심을 느낀 하루.",
    prayer: "45분",
    obedience: "성경 공부 모임 참석",
    bible: "고린도전서 13장",
    exercise: "30분 걷기",
    reading: "기독교 역사 책 읽기",
    mediaTime: 2.0,
    images: ["/placeholder.svg?height=300&width=300"],
    comments: 0,
    likes: 4,
  },
]

// GET 함수 수정 - 페이징 처리 추가
export async function GET(request: NextRequest) {
  // URL에서 쿼리 파라미터 추출
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const nickname = searchParams.get("nickname")

  // 페이징 관련 파라미터
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "5")

  // 날짜 필터링 로직
  let filteredEntries = poberEntries

  // 닉네임 검색이 있는 경우
  if (nickname) {
    filteredEntries = poberEntries.filter((entry) => {
      // 대소문자 구분 없이 닉네임 포함 여부 확인
      return entry.user.name.toLowerCase().includes(nickname.toLowerCase())
    })
  }
  // 날짜 필터링 로직 (기존 코드)
  else if (startDate && endDate) {
    // 날짜 범위 검색
    filteredEntries = poberEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const start = new Date(startDate)
      const end = new Date(endDate)

      // 시작일과 종료일을 포함하여 그 사이의 날짜 필터링
      return entryDate >= start && entryDate <= end
    })
  } else if (startDate) {
    // 시작 날짜만 있는 경우 (종료 날짜는 현재 날짜로 간주)
    const start = new Date(startDate)
    const end = new Date() // 현재 날짜

    filteredEntries = poberEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= start && entryDate <= end
    })
  } else if (endDate) {
    // 종료 날짜만 있는 경우 (시작 날짜는 1년 전으로 간주)
    const end = new Date(endDate)
    const start = new Date(endDate)
    start.setFullYear(start.getFullYear() - 1) // 1년 전

    filteredEntries = poberEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= start && entryDate <= end
    })
  }

  // 날짜 기준으로 내림차순 정렬 (최신순)
  filteredEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // 페이징 처리
  const totalEntries = filteredEntries.length
  const totalPages = Math.ceil(totalEntries / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex)

  // 응답 지연 시뮬레이션 (실제 API 호출처럼 보이게)
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json({
    entries: paginatedEntries,
    totalEntries,
    totalPages,
    currentPage: page,
  })
}

// POST 메서드 추가 - 새 POBER 등록
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 데이터 추출
    const poberData = await request.json()

    // 현재 사용자 정보 (실제로는 인증 시스템에서 가져옴)
    const currentUser = {
      name: "사용자",
      avatar: "/placeholder.svg?height=40&width=40",
    }

    // 새 POBER 항목 생성
    const newPober = {
      id: Date.now(), // 임시 ID 생성 (실제로는 DB에서 생성)
      user: currentUser,
      date: poberData.date || new Date().toISOString().split("T")[0],
      thought: poberData.thought || "",
      prayer: poberData.prayer || "0분",
      obedience: poberData.obedience || "",
      bible: poberData.bible || "",
      exercise: poberData.exercise || "",
      reading: poberData.reading || "",
      mediaTime: poberData.mediaTime || 0,
      images: poberData.images || [],
      comments: 0,
      likes: 0,
    }

    // 배열에 추가 (실제로는 DB에 저장)
    poberEntries.unshift(newPober)

    // 응답 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ success: true, entry: newPober }, { status: 201 })
  } catch (error) {
    console.error("Error creating POBER:", error)
    return NextResponse.json({ success: false, error: "POBER 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
