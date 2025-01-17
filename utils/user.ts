/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "./supabase/server"

export interface UserPlanInfo {
  usage: {
    monthly_usage: number
  }
  maxUsage: number | null
  plan: {
    name: string
    description: string
    max_usage: number
  } | null
  isAuthenticated: boolean
}

export async function getUserPlanInfo(): Promise<UserPlanInfo> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      usage: { monthly_usage: 0 },
      maxUsage: null,
      plan: null,
      isAuthenticated: false
    }
  }

  const { data: userPlan } = await supabase
    .from('user_plans')
    .select(`
      usage_tracking,
      plan:plans(
        name,
        description,
        max_usage
      )
    `)
    .eq('user_id', user.id)
    .is('end_date', null)
    .single()

  return {
    usage: userPlan?.usage_tracking || { monthly_usage: 0 },
    maxUsage: userPlan?.plan?.max_usage || null,
    plan: userPlan?.plan || null,
    isAuthenticated: true
  }
}

export async function checkUsageLimit(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: userPlan } = await supabase
    .from('user_plans')
    .select(`
      usage_tracking,
      plans(max_usage)
    `)
    .eq('user_id', userId)
    .is('end_date', null)
    .single()

  if (!userPlan) return false

  const currentUsage = userPlan.usage_tracking.monthly_usage
  const maxUsage = userPlan.plans.max_usage

  return currentUsage < maxUsage
}
