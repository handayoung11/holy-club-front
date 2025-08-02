import {useState} from "react";
import {Heart} from "lucide-react";
import { baseUrl } from "@/lib/utils";
import { fetchWithAuthRetry } from "@/Auth/fetchWrapper";

interface Props {
  id: number;
  likeCount: number | undefined;
  liked: boolean | undefined;
}

export default function HeartToggle({ id, likeCount, liked }: Props) {
  const [localLiked, setLocalLiked] = useState(liked);
  const [localCount, setLocalCount] = useState(likeCount);

  return (
    <div
      className="flex items-center gap-1.5 mx-3 my-2 rounded-full text-gray-500"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await fetchWithAuthRetry(`${baseUrl}/pober/like/${id}`, {
          method: "POST",
        });
          setLocalLiked((prev) => !prev);
          if (localCount !== undefined) setLocalCount(() => localCount + (localLiked ? -1 : 1));
      }}
    >
      <Heart className="h-5 w-5" fill={localLiked ? "red" : "white"} />
      <span className="text-sm font-medium">{localCount}</span>
    </div>
  );
}
