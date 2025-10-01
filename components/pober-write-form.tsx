"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { PlusIcon, TrashIcon, X, Camera, Clock, BookOpen, Activity, BookMarked } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { cn, baseUrl, getTokenFromLocalStorage } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchWithAuthRetry } from "@/Auth/fetchWrapper"


interface BibleData {
  id: number,
  chapter: string,
  start: number,
  end: number
}
interface PoberData {
  id?: number;
  user?: {
    name: string;
    avatar: string;
  };
  date?: string;
  memo?: string;
  prayer?: number;
  obd?: string;
  bibles?: BibleData[];
  exer?: string; // 실제로는 exercise(운동)
  reading?: string; // 실제로는 read(독서)
  media?: number;
  images?: string[];
  comments?: number;
}

interface PoberWriteFormProps {
  isEditing?: boolean
  initialData?: PoberData
}

export function PoberWriteForm({ isEditing = false, initialData }: PoberWriteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("prayer")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 기본값 설정
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const [date, setDate] = useState(yesterday.toISOString().split("T")[0])
  const [prayerHours, setPrayerHours] = useState(1)
  const [prayerMinutes, setPrayerMinutes] = useState(0)
  const [obedience, setObedience] = useState("")
  const [bibleVerses, setBibleVerses] = useState<string[]>([])
  const [exercise, setExercise] = useState("") // 변수명 수정: evangelism -> exercise
  const [reading, setReading] = useState("") // 변수명 수정: relationship -> reading
  const [mediaTime, setMediaTime] = useState(0)
  const [mediaImage, setMediaImage] = useState<string | null>(null) // 단일 이미지로 변경
  const [mediaImageFile, setMediaImageFile] = useState<File | null>(null);
  const [thought, setThought] = useState("")

  const [isSelectingBible, setIsSelectingBible] = useState(false)
  const [selectedBook, setSelectedBook] = useState<string>("")
  const [startChapter, setStartChapter] = useState<number>(1)
  const [endChapter, setEndChapter] = useState<number>(1)

  // 성경 목록
  const bibleBooks = [
    "창세기",
    "출애굽기",
    "레위기",
    "민수기",
    "신명기",
    "여호수아",
    "사사기",
    "룻기",
    "사무엘상",
    "사무엘하",
    "열왕기상",
    "열왕기하",
    "역대상",
    "역대하",
    "에스라",
    "느헤미야",
    "에스더",
    "욥기",
    "시편",
    "잠언",
    "전도서",
    "아가",
    "이사야",
    "예레미야",
    "예레미야애가",
    "에스겔",
    "다니엘",
    "호세아",
    "요엘",
    "아모스",
    "오바댜",
    "요나",
    "미가",
    "나훔",
    "하박국",
    "스바냐",
    "학개",
    "스가랴",
    "말라기",
    "마태복음",
    "마가복음",
    "누가복음",
    "요한복음",
    "사도행전",
    "로마서",
    "고린도전서",
    "고린도후서",
    "갈라디아서",
    "에베소서",
    "빌립보서",
    "골로새서",
    "데살로니가전서",
    "데살로니가후서",
    "디모데전서",
    "디모데후서",
    "디도서",
    "빌레몬서",
    "히브리서",
    "야고보서",
    "베드로전서",
    "베드로후서",
    "요한일서",
    "요한이서",
    "요한삼서",
    "유다서",
    "요한계시록",
  ]

  // 각 성경의 장 수
  const bibleChapters: Record<string, number> = {
    창세기: 50,
    출애굽기: 40,
    레위기: 27,
    민수기: 36,
    신명기: 34,
    여호수아: 24,
    사사기: 21,
    룻기: 4,
    사무엘상: 31,
    사무엘하: 24,
    열왕기상: 22,
    열왕기하: 25,
    역대상: 29,
    역대하: 36,
    에스라: 10,
    느헤미야: 13,
    에스더: 10,
    욥기: 42,
    시편: 150,
    잠언: 31,
    전도서: 12,
    아가: 8,
    이사야: 66,
    예레미야: 52,
    예레미야애가: 5,
    에스겔: 48,
    다니엘: 12,
    호세아: 14,
    요엘: 3,
    아모스: 9,
    오바댜: 1,
    요나: 4,
    미가: 7,
    나훔: 3,
    하박국: 3,
    스바냐: 3,
    학개: 2,
    스가랴: 14,
    말라기: 4,
    마태복음: 28,
    마가복음: 16,
    누가복음: 24,
    요한복음: 21,
    사도행전: 28,
    로마서: 16,
    고린도전서: 16,
    고린도후서: 13,
    갈라디아서: 6,
    에베소서: 6,
    빌립보서: 4,
    골로새서: 4,
    데살로니가전서: 5,
    데살로니가후서: 3,
    디모데전서: 6,
    디모데후서: 4,
    디도서: 3,
    빌레몬서: 1,
    히브리서: 13,
    야고보서: 5,
    베드로전서: 5,
    베드로후서: 3,
    요한일서: 5,
    요한이서: 1,
    요한삼서: 1,
    유다서: 1,
    요한계시록: 22,
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  // initialData가 있으면 폼 데이터 초기화
  useEffect(() => {
    if (isEditing && initialData) {
      console.log("initialData", initialData);

      // 날짜 설정
      if (initialData.date) {
        setDate(initialData.date)
      }

      // 기도 시간 설정
      if (initialData.prayer) {
        setPrayerHours(Math.floor(initialData.prayer / 60));
        setPrayerMinutes(initialData.prayer % 60);
      }

      // 순종 설정
      if (initialData.obd) {
        setObedience(initialData.obd);
      }

      // 성경 구절 설정
      if (initialData.bibles) {
        const verses = initialData.bibles.map((value) => {
          if (value.start === value.end) {
            return value.chapter + " " + value.start + "장";
          }
          return value.chapter + " " + value.start + "-" + value.end + "장";
        });
        setBibleVerses(verses);
      }

      // 운동(E) 설정
      if (initialData.exer) {
        setExercise(initialData.exer);
      }

      // 독서(R) 설정
      if (initialData.reading) {
        setReading(initialData.reading)
      }

      // 미디어 시간 설정
      if (initialData.media !== undefined) {
        setMediaTime(initialData.media);
      }

      // 한줄 소감 설정
      if (initialData.memo) {
        setThought(initialData.memo);
      }

      // 이미지 설정 (첫 번째 이미지만 사용)
      if (initialData.images && initialData.images.length > 0) {
        setMediaImage(initialData.images[0])
      }
    }
  }, [isEditing, initialData])

  const addBibleVerse = () => {
    setBibleVerses([...bibleVerses, ""])
  }

  const removeBibleVerse = (index: number) => {
    setBibleVerses(bibleVerses.filter((_, i) => i !== index))
  }

  const updateBibleVerse = (index: number, value: string) => {
    const newVerses = [...bibleVerses]
    newVerses[index] = value
    setBibleVerses(newVerses)
  }

  const handleBookSelect = (book: string) => {
    setSelectedBook(book)
    setStartChapter(1)
    setEndChapter(1)
  }

  const addBibleRecord = () => {
    if (selectedBook) {
      const bibleRecord = `${selectedBook} ${startChapter}${startChapter !== endChapter ? `-${endChapter}` : ""}장`
      setBibleVerses([...bibleVerses, bibleRecord])
      setIsSelectingBible(false)
      setSelectedBook("")
      setStartChapter(1)
      setEndChapter(1)
    }
  }

  const getChapterOptions = (book: string) => {
    const chapterCount = bibleChapters[book] || 1
    return Array.from({ length: chapterCount }, (_, i) => i + 1)
  }

  const handleMediaImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setMediaImageFile(files[0]); // 👍 가능하고 안전한 코드
      // 이전 이미지 URL 객체 해제
      if (mediaImage) {
        URL.revokeObjectURL(mediaImage);
      }
      // 첫 번째 파일만 사용
      const newImage = URL.createObjectURL(files[0])
      setMediaImage(newImage)
    }
  }

  const removeMediaImage = () => {
    if (mediaImage) {
      URL.revokeObjectURL(mediaImage)
      setMediaImage(null)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // FormData 생성
      const formData = new FormData();
      // prayer: 시간, 분을 합산해서 분 단위로 변환
      const prayerMinutesTotal = (parseInt(prayerHours, 10) || 0) * 60 + (parseInt(prayerMinutes, 10) || 0);
      formData.append("prayer", String(prayerMinutesTotal));
      formData.append("poberDate", date);
      formData.append("memo", thought || "");
      formData.append("obd", obedience || "");
      formData.append("exer", exercise || "");
      formData.append("reading", reading || "");
      formData.append("media", String(mediaTime));

      // bibleVerses 배열을 bibles[0].chapter, bibles[0].start, ... 형태로 파싱해서 추가
      bibleVerses.forEach((verse, idx) => {
        // 예시: '창세기 1-3장' 또는 '창세기 1장'
        const match = verse.match(/^(.*?)\s(\d+)(?:-(\d+))?장$/);
        if (match) {
          console.log("verse", verse);
          const chapter = match[1];
          const start = match[2];
          const end = match[3] || match[2];
          formData.append(`bibles[${idx}].chapter`, chapter);
          formData.append(`bibles[${idx}].start`, start);
          formData.append(`bibles[${idx}].end`, end);
        }
      });


      // 이미지 배열 추가 (mediaImage가 있으면)
      if (mediaImage && mediaImageFile) {
        formData.append("mediaPic", mediaImageFile);
      }

      formData.forEach((v, k) => console.log(k, v));

      const token = getTokenFromLocalStorage();
      const headers: Record<string, string> = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      let submitResponse
      if (isEditing && initialData?.id) {
        // 수정 API 호출
        submitResponse = await fetchWithAuthRetry(`${baseUrl}/pober/${initialData?.id}`, {
          method: "PATCH",
          headers,
          body: formData,
        });
      } else {
        // 등록 API 호출
        submitResponse = await fetchWithAuthRetry(`${baseUrl}/pober`, {
          method: "POST",
          headers,
          body: formData,
        })
      }

      console.log("submitResponse", submitResponse);

      if (!submitResponse.ok) {
        const msg = await submitResponse.text();
        console.log(msg);
        throw new Error(msg || "API 요청 실패")
      }

      router.push("/")
    } catch (err: Error | any) {
      console.error("Error submitting POBER:", err)
      toast({
        title: "오류 발생",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // 탭 변경 핸들러
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // 탭 색상 설정
  const getTabStyles = (tabValue: string) => {
    const styles = {
      prayer: {
        icon: <Clock className="h-4 w-4 mr-1" />,
        bg: "bg-gradient-to-br from-purple-100 to-purple-50",
        border: "border-purple-200",
        shadow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
        text: "text-purple-800",
        iconBg: "bg-purple-200",
        iconColor: "text-purple-700",
        inputBorder: "focus-within:border-purple-300 focus-within:ring-purple-200",
      },
      obedience: {
        icon: <Activity className="h-4 w-4 mr-1" />,
        bg: "bg-gradient-to-br from-green-100 to-green-50",
        border: "border-green-200",
        shadow: "shadow-[0_0_15px_rgba(74,222,128,0.15)]",
        text: "text-green-800",
        iconBg: "bg-green-200",
        iconColor: "text-green-700",
        inputBorder: "focus-within:border-green-300 focus-within:ring-green-200",
      },
      bible: {
        icon: <BookOpen className="h-4 w-4 mr-1" />,
        bg: "bg-gradient-to-br from-blue-100 to-blue-50",
        border: "border-blue-200",
        shadow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
        text: "text-blue-800",
        iconBg: "bg-blue-200",
        iconColor: "text-blue-700",
        inputBorder: "focus-within:border-blue-300 focus-within:ring-blue-200",
      },
      exercise: {
        icon: <Activity className="h-4 w-4 mr-1" />,
        bg: "bg-gradient-to-br from-amber-100 to-amber-50",
        border: "border-amber-200",
        shadow: "shadow-[0_0_15px_rgba(251,191,36,0.15)]",
        text: "text-amber-800",
        iconBg: "bg-amber-200",
        iconColor: "text-amber-700",
        inputBorder: "focus-within:border-amber-300 focus-within:ring-amber-200",
      },
      reading: {
        icon: <BookMarked className="h-4 w-4 mr-1" />,
        bg: "bg-gradient-to-br from-pink-100 to-pink-50",
        border: "border-pink-200",
        shadow: "shadow-[0_0_15px_rgba(244,114,182,0.15)]",
        text: "text-pink-800",
        iconBg: "bg-pink-200",
        iconColor: "text-pink-700",
        inputBorder: "focus-within:border-pink-300 focus-within:ring-pink-200",
      },
    }

    return styles[tabValue as keyof typeof styles]
  }

  return (
    <Card
      className={cn(
        "border-none shadow-lg rounded-xl transition-all duration-500",
        activeTab === "prayer" && "bg-gradient-to-br from-purple-50 to-white",
        activeTab === "obedience" && "bg-gradient-to-br from-green-50 to-white",
        activeTab === "bible" && "bg-gradient-to-br from-blue-50 to-white",
        activeTab === "exercise" && "bg-gradient-to-br from-amber-50 to-white",
        activeTab === "reading" && "bg-gradient-to-br from-pink-50 to-white",
      )}
    >
      <CardContent className="p-6 space-y-8 bg-transparent">
        <div>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mb-4 border rounded-lg shadow-sm block"
          />
          <Label htmlFor="thought" className="text-sm font-medium">
            오늘의 한줄소감
          </Label>
          <Textarea
            id="thought"
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="오늘 하루를 한 줄로 요약해보세요"
            className="mt-2 min-h-[80px] border rounded-lg shadow-sm"
          />
        </div>

        <Tabs defaultValue="prayer" className="w-full" onValueChange={handleTabChange} value={activeTab}>
          <TabsList className="grid grid-cols-5 mb-4 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger
              value="prayer"
              className="rounded-md flex items-center justify-center transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-200 data-[state=active]:to-purple-100 data-[state=active]:text-purple-800 data-[state=active]:shadow-md"
            >
              <div className="flex items-center">
                <Clock
                  className="h-3.5 w-3.5 mr-1 transition-opacity opacity-0 data-[state=active]:opacity-100"
                  data-state={activeTab === "prayer" ? "active" : "inactive"}
                />
                <span>P</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="obedience"
              className="rounded-md flex items-center justify-center transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-200 data-[state=active]:to-green-100 data-[state=active]:text-green-800 data-[state=active]:shadow-md"
            >
              <div className="flex items-center">
                <Activity
                  className="h-3.5 w-3.5 mr-1 transition-opacity opacity-0 data-[state=active]:opacity-100"
                  data-state={activeTab === "obedience" ? "active" : "inactive"}
                />
                <span>O</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="bible"
              className="rounded-md flex items-center justify-center transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-200 data-[state=active]:to-blue-100 data-[state=active]:text-blue-800 data-[state=active]:shadow-md"
            >
              <div className="flex items-center">
                <BookOpen
                  className="h-3.5 w-3.5 mr-1 transition-opacity opacity-0 data-[state=active]:opacity-100"
                  data-state={activeTab === "bible" ? "active" : "inactive"}
                />
                <span>W</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="exercise"
              className="rounded-md flex items-center justify-center transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-200 data-[state=active]:to-amber-100 data-[state=active]:text-amber-800 data-[state=active]:shadow-md"
            >
              <div className="flex items-center">
                <Activity
                  className="h-3.5 w-3.5 mr-1 transition-opacity opacity-0 data-[state=active]:opacity-100"
                  data-state={activeTab === "exercise" ? "active" : "inactive"}
                />
                <span>E</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="reading"
              className="rounded-md flex items-center justify-center transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-200 data-[state=active]:to-pink-100 data-[state=active]:text-pink-800 data-[state=active]:shadow-md"
            >
              <div className="flex items-center">
                <BookMarked
                  className="h-3.5 w-3.5 mr-1 transition-opacity opacity-0 data-[state=active]:opacity-100"
                  data-state={activeTab === "reading" ? "active" : "inactive"}
                />
                <span>R</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="prayer"
            className={cn(
              "space-y-4 p-4 rounded-lg border transition-all duration-300",
              "bg-gradient-to-br from-purple-100/80 to-purple-50/60",
              getTabStyles("prayer").border,
              getTabStyles("prayer").shadow,
            )}
          >
            <div className="flex items-center mb-3">
              <div className={cn("p-1.5 rounded-full mr-2", getTabStyles("prayer").iconBg)}>
                {getTabStyles("prayer").icon}
              </div>
              <h3 className={cn("font-medium", getTabStyles("prayer").text)}>기도 시간</h3>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 mt-1">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={prayerHours}
                    onChange={(e) => setPrayerHours(e.target.value)}
                    min="0"
                    max="24"
                    className={cn(
                      "border rounded-lg shadow-sm bg-white/80 backdrop-blur-sm",
                      getTabStyles("prayer").inputBorder,
                    )}
                  />
                  <p className="text-xs text-center mt-1 text-muted-foreground">시간</p>
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    value={prayerMinutes}
                    onChange={(e) => setPrayerMinutes(e.target.value)}
                    min="0"
                    max="59"
                    className={cn(
                      "border rounded-lg shadow-sm bg-white/80 backdrop-blur-sm",
                      getTabStyles("prayer").inputBorder,
                    )}
                  />
                  <p className="text-xs text-center mt-1 text-muted-foreground">분</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="obedience"
            className={cn(
              "space-y-4 p-4 rounded-lg border transition-all duration-300",
              "bg-gradient-to-br from-green-100/80 to-green-50/60",
              getTabStyles("obedience").border,
              getTabStyles("obedience").shadow,
            )}
          >
            <div className="flex items-center mb-3">
              <div className={cn("p-1.5 rounded-full mr-2", getTabStyles("obedience").iconBg)}>
                {getTabStyles("obedience").icon}
              </div>
              <h3 className={cn("font-medium", getTabStyles("obedience").text)}>순종 내용</h3>
            </div>
            <Textarea
              id="obedience"
              value={obedience}
              onChange={(e) => setObedience(e.target.value)}
              placeholder="오늘 하나님께 순종한 내용을 기록하세요..."
              className={cn(
                "min-h-[150px] border rounded-lg shadow-sm bg-white/80 backdrop-blur-sm",
                getTabStyles("obedience").inputBorder,
              )}
            />
          </TabsContent>

          <TabsContent
            value="bible"
            className={cn(
              "space-y-4 p-4 rounded-lg border transition-all duration-300",
              "bg-gradient-to-br from-blue-100/80 to-blue-50/60",
              getTabStyles("bible").border,
              getTabStyles("bible").shadow,
            )}
          >
            <div className="flex items-center mb-3">
              <div className={cn("p-1.5 rounded-full mr-2", getTabStyles("bible").iconBg)}>
                {getTabStyles("bible").icon}
              </div>
              <h3 className={cn("font-medium", getTabStyles("bible").text)}>성경 말씀</h3>
            </div>
            <div className="space-y-2">
              {bibleVerses.length > 0 ? (
                bibleVerses.map((verse, index) => (
                  <div key={index} className="flex gap-2">
                    <div
                      className={cn(
                        "flex-1 py-2 px-3 border rounded-lg bg-white/80 backdrop-blur-sm",
                        getTabStyles("bible").inputBorder,
                      )}
                    >
                      {verse}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBibleVerse(index)}
                      className="h-10 w-10 rounded-full"
                    >
                      <TrashIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  "오늘 읽은 말씀" 버튼을 눌러 성경을 추가하세요
                </div>
              )}

              <Dialog open={isSelectingBible} onOpenChange={setIsSelectingBible}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSelectingBible(true)}
                  className={cn("w-full mt-2 border-dashed border-slate-300 bg-white/50", getTabStyles("bible").text)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" /> 오늘 읽은 말씀
                </Button>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>성경 선택</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>성경</Label>
                      <Select value={selectedBook} onValueChange={handleBookSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="성경을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {bibleBooks.map((book) => (
                            <SelectItem key={book} value={book}>
                              {book}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedBook && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>시작 장</Label>
                            <Select
                              value={startChapter.toString()}
                              onValueChange={(value) => {
                                const chapter = Number.parseInt(value)
                                setStartChapter(chapter)
                                if (chapter > endChapter) {
                                  setEndChapter(chapter)
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getChapterOptions(selectedBook).map((chapter) => (
                                  <SelectItem key={`start-${chapter}`} value={chapter.toString()}>
                                    {chapter}장
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>끝 장</Label>
                            <Select
                              value={endChapter.toString()}
                              onValueChange={(value) => setEndChapter(Number.parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getChapterOptions(selectedBook)
                                  .filter((chapter) => chapter >= startChapter)
                                  .map((chapter) => (
                                    <SelectItem key={`end-${chapter}`} value={chapter.toString()}>
                                      {chapter}장
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button onClick={addBibleRecord} className="w-full">
                          추가하기
                        </Button>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent
            value="exercise"
            className={cn(
              "space-y-4 p-4 rounded-lg border transition-all duration-300",
              "bg-gradient-to-br from-amber-100/80 to-amber-50/60",
              getTabStyles("exercise").border,
              getTabStyles("exercise").shadow,
            )}
          >
            <div className="flex items-center mb-3">
              <div className={cn("p-1.5 rounded-full mr-2", getTabStyles("exercise").iconBg)}>
                {getTabStyles("exercise").icon}
              </div>
              <h3 className={cn("font-medium", getTabStyles("exercise").text)}>운동 (Exercise)</h3>
            </div>
            <Textarea
              id="exercise"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              placeholder="오늘의 운동 활동을 기록하세요..."
              className={cn(
                "min-h-[150px] border rounded-lg shadow-sm bg-white/80 backdrop-blur-sm",
                getTabStyles("exercise").inputBorder,
              )}
            />
          </TabsContent>

          <TabsContent
            value="reading"
            className={cn(
              "space-y-4 p-4 rounded-lg border transition-all duration-300",
              "bg-gradient-to-br from-pink-100/80 to-pink-50/60",
              getTabStyles("reading").border,
              getTabStyles("reading").shadow,
            )}
          >
            <div className="flex items-center mb-3">
              <div className={cn("p-1.5 rounded-full mr-2", getTabStyles("reading").iconBg)}>
                {getTabStyles("reading").icon}
              </div>
              <h3 className={cn("font-medium", getTabStyles("reading").text)}>독서 (Reading)</h3>
            </div>
            <Textarea
              id="reading"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              placeholder="오늘 읽은 책과 공부한 내용을 기록하세요..."
              className={cn(
                "min-h-[150px] border rounded-lg shadow-sm bg-white/80 backdrop-blur-sm",
                getTabStyles("reading").inputBorder,
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <Label className="text-sm font-medium">미디어 사용 시간 (시간)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[mediaTime]}
              min={0}
              max={24}
              step={0.5}
              onValueChange={(value) => setMediaTime(value[0])}
              className="flex-1"
            />
            <span className="w-12 text-center">{mediaTime}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">미디어 스크린샷</Label>
          <div className="mt-2">
            {mediaImage ? (
              <div className="relative mb-3 rounded-lg overflow-hidden border aspect-video">
                <img src={mediaImage || "/placeholder.svg"} alt="스크린샷" className="w-full h-full object-contain" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={removeMediaImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex items-center justify-center border border-dashed rounded-lg h-40 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={triggerFileInput}
              >
                <div className="flex flex-col items-center">
                  <Camera className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">스크린샷 추가</span>
                  <span className="text-xs text-muted-foreground mt-1">스크린타임 이미지를 등록하세요</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMediaImageUpload}
                  className="hidden"
                  aria-label="미디어 이미지 업로드"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0 flex gap-3 bg-transparent">
        <Button variant="outline" className="flex-1 rounded-lg" onClick={handleCancel}>
          취소
        </Button>
        <Button
          className={cn(
            "flex-1 rounded-lg transition-all duration-300",
            activeTab === "prayer" && "bg-purple-600 hover:bg-purple-700",
            activeTab === "obedience" && "bg-green-600 hover:bg-green-700",
            activeTab === "bible" && "bg-blue-600 hover:bg-blue-700",
            activeTab === "exercise" && "bg-amber-600 hover:bg-amber-700",
            activeTab === "reading" && "bg-pink-600 hover:bg-pink-700",
          )}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "처리 중..." : isEditing ? "수정" : "저장"}
        </Button>
      </CardFooter>
    </Card>
  )
}
