import { type NextRequest, NextResponse } from "next/server"

// 샘플 댓글 데이터
const commentsData: Record<string, any[]> = {
  "1": [
    {
      id: 1,
      user: {
        name: "김철수",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content: "오늘도 좋은 하루 보내셨네요! 저도 요한계시록 읽고 있어요.",
      timestamp: "10분 전",
      replies: [
        {
          id: 101,
          user: {
            name: "홍길동",
            avatar: "/placeholder.svg?height=32&width=32",
          },
          content: "네, 함께 말씀 읽어요!",
          timestamp: "5분 전",
        },
      ],
    },
    {
      id: 2,
      user: {
        name: "이영희",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content: "기도 시간을 꾸준히 지키시는 모습이 정말 본받을 만해요.",
      timestamp: "30분 전",
      replies: [],
    },
  ],
  "2": [
    {
      id: 3,
      user: {
        name: "박지성",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content: "운동 열심히 하셨네요! 저도 자극받아 운동해야겠어요.",
      timestamp: "1시간 전",
      replies: [],
    },
  ],
  "3": [
    {
      id: 4,
      user: {
        name: "최민수",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content: "마태복음 5-7장은 산상수훈이죠. 정말 좋은 말씀입니다.",
      timestamp: "2시간 전",
      replies: [
        {
          id: 102,
          user: {
            name: "이영희",
            avatar: "/placeholder.svg?height=32&width=32",
          },
          content: "네, 매일 읽어도 새로운 깨달음이 있어요.",
          timestamp: "1시간 전",
        },
      ],
    },
  ],
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // URL에서 id 파라미터 추출
  const id = params.id

  // 해당 Pober의 댓글 가져오기
  const comments = commentsData[id] || []

  // 응답 지연 시뮬레이션 (실제 API 호출처럼 보이게)
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json({ comments })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // URL에서 id 파라미터 추출
  const id = params.id

  // 요청 본문에서 댓글 내용 추출
  const { content, parentId } = await request.json()

  // 새 댓글 ID 생성 (실제로는 데이터베이스에서 생성)
  const newCommentId = Date.now()

  // 새 댓글 객체 생성
  const newComment = {
    id: newCommentId,
    user: {
      name: "사용자",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    content,
    timestamp: "방금 전",
    replies: [],
  }

  // 댓글 배열이 없으면 초기화
  if (!commentsData[id]) {
    commentsData[id] = []
  }

  // 부모 댓글 ID가 있으면 답글로 추가, 없으면 새 댓글로 추가
  if (parentId) {
    const parentComment = commentsData[id].find((comment) => comment.id === parentId)
    if (parentComment) {
      const reply = {
        id: newCommentId,
        user: {
          name: "사용자",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content,
        timestamp: "방금 전",
      }
      parentComment.replies.push(reply)
    }
  } else {
    commentsData[id].unshift(newComment)
  }

  // 응답 지연 시뮬레이션 (실제 API 호출처럼 보이게)
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json({ success: true, comment: newComment })
}
