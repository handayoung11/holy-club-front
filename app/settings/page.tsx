"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CameraIcon, Bell, LogOut, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { fetchWithAuthRetry } from "@/Auth/fetchWrapper"
import { baseUrl, isLoggedIn, logout } from "@/lib/utils"
import { LoginRequiredStatsDialog } from "@/components/login-required-stat-dialog"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [nickname, setNickname] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [newNickname, setNewNickname] = useState("")
  const [regDate, setRegDate] = useState<Date>()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [profileImage, setProfileImage] = useState<string>("")
  const [newProfileImage, setNewProfileImage] = useState("")
  const [newProfileImageFile, setNewProfileImageFile] = useState<File>()
  const [deleteProfile, setDeleteProfile] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter();

  
  const fetchData = async () => {
    try {
      const res = await fetchWithAuthRetry(`${baseUrl}/user/me`);
      const data = await res.json();
      setNickname(data.nickname || "사용자 이름");
      setRegDate(new Date(data.createdAt));
      setProfileImage(`${baseUrl}/file/${data.profile}`);
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    if (!isLoggedIn()) {
      setShowLoginDialog(true);
      return;
    }
    fetchData();
  }, [])

  const updateUserData = async() => {
    try {
      const formData = new FormData();
      formData.append("nickname", newNickname);
      if (deleteProfile) {
        formData.append("deleteProfile", "true");
      } else if (newProfileImage && newProfileImageFile) {
        formData.append("profileImg", newProfileImageFile);
      }
      const res = await fetchWithAuthRetry(`${baseUrl}/user/me`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) throw new Error('프로필 수정 실패');

      setNickname(newNickname)
      if (deleteProfile) {
        setProfileImage("");
        setNewProfileImage("");
        setNewProfileImageFile(undefined);
      }
      setDeleteProfile(false)
      setIsEditing(false)
      toast({
        title: "프로필 수정 완료",
        variant: "success",
      })
      fetchData();
    } catch(err) {
      console.log(err);
      toast({
        title: "프로필 수정 실패",
        variant: "destructive",
      })
    }
  };

  const handleSaveNickname = () => {
    if (newNickname.trim() === "") {
      toast({
        title: "닉네임 오류",
        description: "닉네임을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    updateUserData();
  }

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith("image/")) {
        toast({
          title: "파일 형식 오류",
          description: "이미지 파일만 업로드할 수 있습니다.",
          variant: "destructive",
        })
        return
      }

      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "파일 크기 오류",
          description: "5MB 이하의 이미지만 업로드할 수 있습니다.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewProfileImage(event.target.result as string);
          setNewProfileImageFile(file);
        }
      }
      reader.readAsDataURL(file)
      setDeleteProfile(false)
    }
  }

  const handleDeleteProfileImage = () => {
    setDeleteProfile(true)
    setNewProfileImage("")
    setNewProfileImageFile(undefined)
    if (fileInputRef.current)
      fileInputRef.current.value = "";
  }

  const handleCloseDialog = () => {
    setShowLoginDialog(false);
    if (!isLoggedIn()) {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto">
      <MobileHeader title="설정" />

      <LoginRequiredStatsDialog
        isOpen={showLoginDialog}
        onClose={handleCloseDialog}
      />

      <div className="flex-1 p-3 pb-20">
        <Card className="mb-4">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-base">프로필 설정</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={isEditing && !deleteProfile ? newProfileImage : (deleteProfile ? undefined : profileImage)} alt="프로필 이미지" />
                  <AvatarFallback>{nickname.charAt(0)}</AvatarFallback>
                </Avatar>
               {isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-white shadow-sm"
                    onClick={handleImageClick}
                  >
                    <CameraIcon className="h-3 w-3" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      aria-label="프로필 이미지 업로드"
                    />
                  </Button>
                  {((profileImage || newProfileImage) && !deleteProfile) && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 rounded-full shadow-sm"
                      onClick={handleDeleteProfileImage}
                      title="프로필 사진 삭제"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </>
               )}
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-xs">
                      닉네임
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="nickname"
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button size="sm" className="h-8" onClick={handleSaveNickname}>
                        저장
                      </Button>
                      <Button size="sm" className="h-8" variant="destructive" onClick={() => {
                        setIsEditing(false)
                        setDeleteProfile(false)
                      }}>
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-muted-foreground">닉네임</Label>
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                        setNewNickname(nickname)
                        setNewProfileImage(profileImage);
                        setDeleteProfile(false);
                        setIsEditing(true);
                      }}>
                        변경
                      </Button>
                    </div>
                    <p className="font-medium">{nickname || 'Loading...'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>가입일: {regDate && `${regDate?.getFullYear()}년 ${regDate?.getMonth() + 1}월 ${regDate?.getDate()}일`}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-base">앱 설정</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="notifications" className="text-sm">
                  알림
                </Label>
              </div>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <Button
              variant="outline"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>

      <MobileNavigation />
    </div>
  )
}
