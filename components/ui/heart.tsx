import {useState} from "react";
import {Heart} from "lucide-react";
import { baseUrl, isLoggedIn } from "@/lib/utils";
import { fetchWithAuthRetry } from "@/Auth/fetchWrapper";
import { useToast } from "@/hooks/use-toast"

interface Props {
  id: number;
  likeCount: number | undefined;
  liked: boolean | undefined;
}

export default function HeartToggle({ id, likeCount, liked }: Props) {
  const [localLiked, setLocalLiked] = useState(liked);
  const [localCount, setLocalCount] = useState(likeCount);
  const { toast } = useToast();

  return (
    <div
      className="flex items-center gap-1.5 mx-3 my-2 rounded-full text-gray-500"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn()) {
          toast({
            title: "오류 발생",
            description: "로그인 후 이용해주세요.",
            variant: "destructive",
          });
          return;
        }

        const res = await fetchWithAuthRetry(`${baseUrl}/pober/like/${id}`, {
          method: "POST",
        });

        if(!res.ok) {
          toast({
            title: "오류 발생",
            description: "좋아요 업데이트에 실패했습니다.",
            variant: "destructive",
          });
          return;
        }

        setLocalLiked((prev) => !prev);
        if (localCount !== undefined) setLocalCount(() => localCount + (localLiked ? -1 : 1));
      }}
    >
      <Heart className="h-5 w-5" fill={localLiked ? "red" : "white"} />
      <span className="text-sm font-medium">{localCount}</span>
    </div>
  );
}
