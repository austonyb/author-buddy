import { Progress } from "@/components/ui/progress"

interface UsageProgressProps {
  currentUsage: number
  maxUsage: number | null
  label?: string
}

export function UsageProgress({ currentUsage, maxUsage, label = "Usage this month" }: UsageProgressProps) {
  if (!maxUsage) return null

  const percentage = (currentUsage / maxUsage) * 100

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground flex justify-between">
        <span>{label}</span>
        <span>{currentUsage} / {maxUsage} requests</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}
