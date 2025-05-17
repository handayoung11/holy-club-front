import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen max-w-md mx-auto">
      <MobileHeader title="소개" />

      <div className="flex-1 p-4 pb-20">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Holy Club이란?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Holy Club은 여러분의 영적 성장을 돕기 위한 앱입니다. 매일 POBER 5요소를 기록하고 공유하여 신앙 생활을 더욱
              풍성하게 만들어보세요.
            </p>
            <p className="mb-4">
              기존에는 카카오톡에 개인별로 기도, 말씀, 공부 등을 기록했지만, 이제는 Holy Club 앱에서 한 번에 기록하고
              공유할 수 있습니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>POBER 5요소란?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li>
                <strong>P - Prayer (기도)</strong>
                <p className="text-sm text-muted-foreground">하나님과의 대화를 통해 영적 성장을 이루는 시간</p>
              </li>
              <li>
                <strong>O - Obedience (순종)</strong>
                <p className="text-sm text-muted-foreground">하나님의 말씀에 순종하며 살아가는 삶</p>
              </li>
              <li>
                <strong>B - Bible (성경)</strong>
                <p className="text-sm text-muted-foreground">하나님의 말씀을 읽고 묵상하는 시간</p>
              </li>
              <li>
                <strong>E - Evangelism (전도)</strong>
                <p className="text-sm text-muted-foreground">복음을 전하고 나누는 활동</p>
              </li>
              <li>
                <strong>R - Relationship (관계)</strong>
                <p className="text-sm text-muted-foreground">하나님과 이웃과의 관계를 돌아보는 시간</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <MobileNavigation />
    </div>
  )
}
