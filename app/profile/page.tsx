"use client"

import { useEffect, useState } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PoberEntry, PoberList } from "@/components/pober-list"
import { BarChart3, Settings } from "lucide-react"
import Link from "next/link"
import { baseUrl, getTokenFromLocalStorage, isLoggedIn } from "@/lib/utils"
import { fetchWithAuthRetry } from "@/Auth/fetchWrapper"
import { LoginRequiredStatsDialog } from "@/components/login-required-stat-dialog"
import { useRouter } from "next/navigation"

export interface userDataEntry {
  createdAt: string,
  id: number,
  nickname: string,
  profile: string
}

export default function ProfilePage() {

  const [userData, setUserData] = useState<userDataEntry>({
    createdAt: "",
    id:0,
    nickname:"",
    profile:"",
  });

  const [userEntry, setUserEntry] = useState<PoberEntry[]>();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const router = useRouter();

  const getUserData = async () => {
    const token = getTokenFromLocalStorage();
    let url = `${baseUrl}/user/me`;
    const response = await fetchWithAuthRetry(url);

    const data = await response.json();
    
    setUserData(data);
    
    
    url = `${baseUrl}/pober?name=${data.nickname}`;
    const poberResponse = await fetchWithAuthRetry(url);
    
    const poberData = await poberResponse.json();
    setUserEntry(poberData);
  }
  
  useEffect(() => {
    if (!isLoggedIn()) {
      setShowLoginDialog(true);
      return;
    }
    getUserData();
  }, [])
  
  const handleCloseDialog = () => {
      setShowLoginDialog(false);
      if (!isLoggedIn()) {
        router.push("/");
      }
    };

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto">
      <MobileHeader title="MyPage" />

      <LoginRequiredStatsDialog
        isOpen={showLoginDialog}
        onClose={handleCloseDialog}
      />

      <div className="flex-1 p-3 pb-20">
        <Card className="mb-4">
          <CardContent className="pt-4 px-4 pb-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={`${baseUrl}/file/${userData.profile}`}
                    alt="프로필 이미지"
                  />
                  <AvatarFallback></AvatarFallback>
                </Avatar>
              </div>
              <h2 className="mt-3 text-lg font-bold">{userData.nickname}</h2>
              {/* <p className="text-xs text-muted-foreground">user@example.com</p> */}

              <div className="flex gap-2 mt-3">
                <Link href="/stats">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-8 text-xs"
                  >
                    <BarChart3 className="h-3 w-3" />
                    <span>통계</span>
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-8 text-xs"
                  >
                    <Settings className="h-3 w-3" />
                    <span>설정</span>
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          {/* <CardHeader className="p-3 pb-0">
            <CardTitle className="text-base">나의 기록</CardTitle>
          </CardHeader> */}
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium">나의 기록</h3>
                <Link href="/" className="text-xs text-primary">
                  전체보기
                </Link>
              </div>
              <PoberList entries={userEntry} />
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNavigation />
    </div>
  );
}
