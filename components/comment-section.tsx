"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Edit2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface CommentUser {
  name: string;
  avatar: string;
}

interface Reply {
  id: number;
  user: CommentUser;
  content: string;
  timestamp: string;
}

interface Comment {
  id: number;
  user: CommentUser;
  content: string;
  timestamp: string;
  replies: Reply[];
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        const response = await fetch(`/api/pober/${postId}/comments`);

        if (!response.ok) {
          throw new Error("댓글을 불러오는데 실패했습니다");
        }

        const data = await response.json();
        setComments(data.comments);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("댓글을 불러오는데 문제가 발생했습니다");
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/pober/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error("댓글 작성에 실패했습니다");
      }

      const data = await response.json();

      // 실제 API 응답에서는 새로운 댓글 목록을 다시 가져오거나
      // 새 댓글을 목록에 추가하는 방식으로 처리할 수 있습니다
      setComments([data.comment, ...comments]);
      setNewComment("");

      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다.",
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      toast({
        title: "댓글 작성 실패",
        description: "댓글 작성에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (commentId: number) => {
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/pober/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: replyContent, parentId: commentId }),
      });

      if (!response.ok) {
        throw new Error("답글 작성에 실패했습니다");
      }

      // 성공 시 댓글 목록 업데이트
      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [
              ...comment.replies,
              {
                id: Date.now(),
                user: {
                  name: "사용자",
                  avatar: "/placeholder.svg?height=24&width=24",
                },
                content: replyContent,
                timestamp: "방금 전",
              },
            ],
          };
        }
        return comment;
      });

      setComments(updatedComments);
      setReplyContent("");
      setReplyingTo(null);

      toast({
        title: "답글 작성 완료",
        description: "답글이 성공적으로 작성되었습니다.",
      });
    } catch (err) {
      console.error("Error adding reply:", err);
      toast({
        title: "답글 작성 실패",
        description: "답글 작성에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/pober/${postId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: editContent }),
        }
      );

      if (!response.ok) {
        throw new Error("댓글 수정에 실패했습니다");
      }

      // 댓글 목록 업데이트
      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, content: editContent };
        }
        return comment;
      });

      setComments(updatedComments);
      setEditingCommentId(null);
      setEditContent("");

      toast({
        title: "댓글 수정 완료",
        description: "댓글이 성공적으로 수정되었습니다.",
      });
    } catch (err) {
      console.error("Error editing comment:", err);
      toast({
        title: "댓글 수정 실패",
        description: "댓글 수정에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/pober/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("댓글 삭제에 실패했습니다");
      }

      // 댓글 목록에서 제거
      const updatedComments = comments.filter(
        (comment) => comment.id !== commentId
      );
      setComments(updatedComments);

      toast({
        title: "댓글 삭제 완료",
        description: "댓글이 성공적으로 삭제되었습니다.",
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast({
        title: "댓글 삭제 실패",
        description: "댓글 삭제에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditContent(currentContent);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="flex gap-2 mb-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-[80px] w-full mb-2" />
            <div className="flex justify-end">
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-12 w-full mb-2" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" />
        댓글{" "}
        {comments.reduce((acc, comment) => acc + 1 + comment.replies.length, 0)}
      </h2>

      <div className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src="/placeholder.svg?height=32&width=32"
            alt="사용자 프로필"
          />
          <AvatarFallback>사용자</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="댓글을 작성하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] mb-2"
            disabled={submitting}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              size="sm"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? "작성 중..." : "댓글 작성"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-3">
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={comment.user.avatar || "/placeholder.svg"}
                    alt={`${comment.user.name} 프로필`}
                  />
                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{comment.user.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {comment.timestamp}
                      </p>
                      {comment.user.name === "사용자" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                            onClick={() =>
                              startEditing(comment.id, comment.content)
                            }
                            disabled={submitting}
                            title="댓글 수정"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={submitting}
                            title="댓글 삭제"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="mt-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] mb-2 text-sm"
                        disabled={submitting}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                          disabled={submitting}
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditComment(comment.id)}
                          disabled={submitting || !editContent.trim()}
                        >
                          {submitting ? "수정 중..." : "수정 완료"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm mt-1">{comment.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs mt-1 h-auto py-1"
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment.id ? null : comment.id
                          )
                        }
                        disabled={submitting}
                      >
                        답글 달기
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {replyingTo === comment.id && (
                <div className="flex gap-2 mt-2 pl-10">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src="/placeholder.svg?height=24&width=24"
                      alt="사용자 프로필"
                    />
                    <AvatarFallback>사용자</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="답글을 작성하세요..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[60px] mb-2 text-sm"
                      disabled={submitting}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                        disabled={submitting}
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddReply(comment.id)}
                        disabled={submitting || !replyContent.trim()}
                      >
                        {submitting ? "작성 중..." : "답글 작성"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {comment.replies.length > 0 && (
                <div className="pl-10 mt-2 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={reply.user.avatar || "/placeholder.svg"}
                          alt={`${reply.user.name} 프로필`}
                        />
                        <AvatarFallback>
                          {reply.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-xs">
                            {reply.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reply.timestamp}
                          </p>
                        </div>
                        <p className="text-sm mt-1">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
