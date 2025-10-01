"use client"

import { useState, useEffect } from "react"
import { use } from "react";
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CommentSection } from "@/components/comment-section"
import { Clock, BookMarked, Users, MessageSquare, Activity, Edit, Trash2, Quote, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { baseUrl, getTokenFromLocalStorage } from "@/lib/utils"
import { fetchWithAuthRetry } from "@/Auth/fetchWrapper"

// 기존 PoberEntry 인터페이스 삭제 후 새로 정의
interface PoberDetailResponse {
  id: number
  user: {
    id: number
    name: string
    avatar: string
  }
  bibles?: any[]
  date: string
  memo?: string
  prayer?: number
  obd?: string
  exer?: string
  reading?: string
  media?: number
  mediaPic?: string
  comments: any[]
  commentCount: number
  likeCount: number
  liked: boolean
}

export default function PoberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { toast } = useToast();
  const token = getTokenFromLocalStorage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pober, setPober] = useState<PoberDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [fetching, setFetching] = useState(false);

  const [detailImage, setDetailImage] = useState();


  async function fetchPoberDetail() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuthRetry(
        `${baseUrl}/pober/${id}`,
      );

      if (!response.ok) {
        if (response.status === 404)
          throw new Error("Pober를 찾을 수 없습니다");
        throw new Error("데이터를 불러오는데 실패했습니다");
      }

      const data = await response.json();
      setPober(data);
      setLikeCount(data.likeCount);
      setIsLiked(data.liked);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "데이터를 불러오는데 문제가 발생했습니다"
      );
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }

  useEffect(() => {
    setFetching(true);
    console.log('active')
    fetchPoberDetail();
    return () => {
      setFetching(false);
    };
  }, []);

  const handleLikeToggle = async () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`${baseUrl}/pober/like/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
      if (!response.ok) throw new Error("좋아요 업데이트 실패");
    } catch (err) {
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      toast({
        title: "오류 발생",
        description: "좋아요 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // API 호출로 데이터 삭제
      const response = await fetch(`${baseUrl}/pober/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        throw new Error("삭제 요청 실패");
      }

      toast({
        title: "삭제 완료",
        description: "POBER 기록이 삭제되었습니다.",
      });

      router.push("/");
    } catch (err) {
      console.error("Error deleting POBER:", err);
      toast({
        title: "삭제 실패",
        description: "POBER 기록 삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const onAddComment = async (content: string) => {
    try {
      const response = await fetch(`${baseUrl}/pober-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          content,
          poberId: id,
        }),
      });

      if (!response.ok) {
        throw new Error("삭제 요청 실패");
      }

      toast({
        title: "댓글 작성 완료",
        description: "POBER 댓글 작성이 완료되었습니다.",
      });

      fetchPoberDetail();
    } catch (err) {
      console.error("Error deleting POBER:", err);
      toast({
        title: "댓글 작성 실패",
        description: "POBER 기록 작성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // 로딩 중일 때 스켈레톤 UI 표시
  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-screen max-w-md mx-auto">
        <MobileHeader title="POWER 상세" showBackButton />

        <div className="flex-1 p-4 pb-20">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>

              <Skeleton className="h-20 w-full mb-4" />

              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <MobileNavigation />
      </div>
    );
  }

  // 에러 발생 시 에러 메시지 표시
  if (error || !pober) {
    return (
      <div className="flex flex-col w-full min-h-screen max-w-md mx-auto">
        <MobileHeader title="POWER 상세" showBackButton />

        <div className="flex-1 p-4 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              {error || "Pober를 찾을 수 없습니다"}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              홈으로 돌아가기
            </Button>
          </div>
        </div>

        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto">
      <MobileHeader title="POWER 상세" showBackButton />

      {pober && (
        <div className="flex-1 p-4 pb-20">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        pober.user.avatar
                          ? `/${pober.user.avatar}`
                          : "/placeholder.svg"
                      }
                      alt={`${pober.user.name}의 프로필 이미지`}
                    />
                    <AvatarFallback>{pober.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{pober.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pober.date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 px-2 flex items-center gap-1 ${
                      isLiked ? "text-red-500 border-red-200" : ""
                    }`}
                    onClick={handleLikeToggle}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${isLiked ? "fill-red-500" : ""}`}
                    />
                    <span>{likeCount}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 flex items-center gap-1"
                    onClick={() =>
                      router.push(`/write/edit/${id}`)
                    }
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>수정</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>삭제</span>
                  </Button>
                </div>
              </div>

              {/* 메모(한줄소감) */}
              {pober.memo && (
                <div className="mb-4 bg-gradient-to-br from-gray-50 to-slate-50 p-3 rounded-lg border border-gray-100/30 shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="bg-gray-100 rounded-full p-1.5 flex-shrink-0">
                      <Quote className="h-3.5 w-3.5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        오늘의 한줄소감
                      </p>
                      <p className="text-sm leading-relaxed text-slate-700 italic">
                        {pober.memo}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {pober.prayer !== undefined && (
                  <div className="bg-gradient-to-br from-purple-50 to-slate-50 p-3 rounded-lg border border-purple-100/30 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-purple-100 rounded-full p-1.5 flex-shrink-0">
                        <Clock className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-purple-600 mb-1 flex items-center">
                          기도 <span className="ml-1 text-purple-400">(P)</span>
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {pober.prayer}분
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {pober.obd && (
                  <div className="bg-gradient-to-br from-green-50 to-slate-50 p-3 rounded-lg border border-green-100/30 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-green-100 rounded-full p-1.5 flex-shrink-0">
                        <Activity className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-600 mb-1 flex items-center">
                          순종 <span className="ml-1 text-green-400">(O)</span>
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {pober.obd}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {pober.bibles && pober.bibles.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-3 rounded-lg border border-blue-100/30 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-blue-100 rounded-full p-1.5 flex-shrink-0">
                        <BookMarked className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-600 mb-1 flex items-center">
                          말씀 <span className="ml-1 text-blue-400">(W)</span>
                        </p>
                        {pober.bibles.map((bible, idx) => (
                          <p key={idx}>
                            {bible.chapter} {bible.start}장 ~ {bible.end}장
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {pober.exer && (
                  <div className="bg-gradient-to-br from-amber-50 to-slate-50 p-3 rounded-lg border border-amber-100/30 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-amber-100 rounded-full p-1.5 flex-shrink-0">
                        <Activity className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-amber-600 mb-1 flex items-center">
                          운동 <span className="ml-1 text-amber-400">(E)</span>
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {pober.exer}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {pober.reading && (
                  <div className="bg-gradient-to-br from-pink-50 to-slate-50 p-3 rounded-lg border border-pink-100/30 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-pink-100 rounded-full p-1.5 flex-shrink-0">
                        <Users className="h-3.5 w-3.5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-pink-600 mb-1 flex items-center">
                          독서 <span className="ml-1 text-pink-400">(R)</span>
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {pober.reading}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {pober.media !== undefined && (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-slate-200 rounded-full p-1.5 flex-shrink-0">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-600 mb-1">
                          미디어 사용 시간
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {pober.media}분
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {pober.mediaPic && (
                <div>
                  <h3 className="font-medium mb-2">스크린샷/사진</h3>
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={`${baseUrl}/file/${pober.mediaPic}`}
                      alt="스크린샷/사진"
                      className="w-full object-cover rounded-lg"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                </div>
              )}
              </div>
            </CardContent>
          </Card>

          <Separator className="my-4" />

          <CommentSection
            postId={id}
            commentCount={pober.commentCount}
            comments={pober.comments}
            onAddComment={onAddComment}
            fetchPoberDetail={fetchPoberDetail}
          />
        </div>
      )}

      <MobileNavigation />

      {/* 삭제 다이얼로그는 기존과 동일 */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>POBER 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 POBER 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수
              없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
