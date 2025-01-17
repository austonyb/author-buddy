import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PlanButton } from "@/components/profile/plan-button";
import { UsageProgress } from "@/components/usage-progress";
import { getUserPlanInfo } from "@/utils/user";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { plan, usage, maxUsage } = await getUserPlanInfo();

  // Fetch all available plans
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('max_usage', { ascending: true });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Your Profile</h1>
        
        {/* Account Information */}
        <section className="mb-12 p-8 rounded-lg border bg-card border-border">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Account Information</h2>
          <div className="space-y-3">
            <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground ml-2">{user.email}</span></p>
            <p><span className="text-muted-foreground">Member since:</span> <span className="text-foreground ml-2">{new Date(user.created_at).toLocaleDateString()}</span></p>
          </div>
        </section>

        {/* Current Plan */}
        <section className="mb-12 p-8 rounded-lg border bg-card border-border">
          <div className="flex flex-col gap-y-4">
            <h2 className="text-xl font-semibold text-foreground">Current Plan</h2>
            {plan ? (
              <>
                <div className="text-lg text-foreground">{plan.name}</div>
                <p className="text-muted-foreground">{plan.description}</p>
                <UsageProgress
                  currentUsage={usage.monthly_usage}
                  maxUsage={maxUsage}
                  label="Monthly Usage"
                />
              </>
            ) : (
              <div className="flex flex-col gap-y-2">
                <p className="text-sm text-muted-foreground">No active plan</p>
                <PlanButton label="Choose a plan" />
              </div>
            )}
          </div>
        </section>

        {/* Available Plans */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <div key={plan.id} className="p-8 rounded-lg border bg-card border-border">
                <div className="flex flex-col gap-y-4">
                  <h3 className="text-lg font-medium text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Up to {plan.max_usage} lookups per month
                  </p>
                  <div className="pt-4">
                    {plan.id === plan.id ? (
                      <button 
                        disabled
                        className="w-full h-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium cursor-not-allowed"
                      >
                        Subscribed
                      </button>
                    ) : (
                      <PlanButton 
                        planId={plan.id} 
                        label="Select Plan" 
                        className="w-full h-10"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
