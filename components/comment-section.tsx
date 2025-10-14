"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { baseUrl, formatDateTime, getTokenFromLocalStorage } from "@/lib/utils";
import { useState } from "react"

interface User {
  id: number
  name: string
  avatar: string
}

export interface Comment {
  id: number
  content: string
  createdAt: string
  user: User
  comments: Comment[] // 2depth까지 지원
}

interface CommentSectionProps {
  postId: string | number;
  commentCount: number;
  comments: Comment[];
  onAddComment?: (content: string) => void; // 댓글 등록 콜백
  fetchPoberDetail: () => void;
}

export function CommentSection({
  postId,
  commentCount,
  comments,
  onAddComment,
  fetchPoberDetail,
}: CommentSectionProps) {
  // 댓글 입력 상태
  const [newComment, setNewComment] = useState("");
  const [newDetailComment, setNewDetailComment] = useState("");
  // 댓글 입력 상태 등은 필요시 여기에 구현
  // fetch 등 자체 데이터 패칭 로직은 완전히 제거

  // 대댓글 입력창 토글 상태 관리 (id별로)
  const [replyOpen, setReplyOpen] = useState<{ [key: number]: boolean }>({});

  const handleReplyToggle = (id: number) => {
    setReplyOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 댓글 등록 핸들러
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    if (onAddComment) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const token = getTokenFromLocalStorage();

  const handleReAddComment = async (commentId: number) => {
    if (!newDetailComment.trim()) return;

    try {
      const response = await fetch(`${baseUrl}/pober-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          content: newDetailComment,
          poberId: postId,
          commentId: commentId,
        }),
      });

      if (!response.ok) {
        throw new Error("삭제 요청 실패");
      }

      handleReplyToggle(commentId);
      fetchPoberDetail();
    } catch (err) {
      console.error("Error deleting POBER:", err);
    } finally {
    }
  };

  // 댓글 렌더링 (재귀, 2depth 제한)
  const renderComments = (comments: Comment[], depth = 0) => {
    if (depth > 1) return null;
    return (
      <ul
        className={
          depth === 0
            ? "space-y-4"
            : "space-y-2 ml-6 border-l pl-4 border-gray-100"
        }
      >
        {comments.map((comment) => (
          <li key={comment.id} className="">
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`${baseUrl}/file/${comment.user.avatar}`}
                  alt={comment.user.name}
                />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDateTime(new Date(comment.createdAt))}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  {comment.content}
                </div>
                <div>
                  {depth < 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-1 py-0.5 h-6"
                      onClick={() => handleReplyToggle(comment.id)}
                    >
                      답글
                    </Button>
                  )}
                  {/* 대댓글 입력창 (예시) */}
                  {replyOpen[comment.id] && depth < 1 && (
                    <div className="mt-2">
                      <input
                        className="border rounded px-2 py-1 text-sm w-full"
                        placeholder="답글을 입력하세요"
                        value={newDetailComment}
                        onChange={(e) => setNewDetailComment(e.target.value)}
                      />
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => handleReAddComment(comment.id)}
                        >
                          등록
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => handleReplyToggle(comment.id)}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {/* 2depth 대댓글 렌더링 */}
                {comment.comments &&
                  comment.comments.length > 0 &&
                  renderComments(comment.comments, depth + 1)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="mt-6">
      <h3 className="font-semibold mb-2 text-base">
        댓글 <span className="text-primary">{commentCount}</span>
      </h3>
      {/* 댓글 입력창 */}
      <div className="mb-4">
        <textarea
          className="flex-1 border rounded px-2 py-1 text-sm w-full resize-none min-h-[60px]"
          placeholder="댓글을 작성해주세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            className="h-8 px-4"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            댓글 작성
          </Button>
        </div>
      </div>
      {comments && comments.length > 0 ? (
        renderComments(comments)
      ) : (
        <div className="text-gray-400 text-sm">아직 댓글이 없습니다.</div>
      )}
      {/* 대댓글 입력창 등은 필요시 추가 구현 */}
    </section>
  );
}
