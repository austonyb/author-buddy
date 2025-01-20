import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PlanButton } from "@/components/profile/plan-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Authentication error:", error);
    redirect("/login");
  }

  // Fetch user's current plan
  const { data: userPlan, error: planError } = await supabase
    .from('user_plans')
    .select(`
      *,
      plan:plans(
        name,
        description,
        max_usage
      )
    `)
    .eq('user_id', user.id)
    .is('end_date', null)
    .single();

  if (planError && planError.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error("Error fetching user plan:", planError);
  }

  // Fetch all available plans
  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('*')
    .order('max_usage', { ascending: true });

  if (plansError) {
    console.error("Error fetching plans:", plansError);
  }
  
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
            {userPlan ? (
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-row items-center gap-x-2">
                  <span className="font-medium text-foreground">{userPlan.plan.name}</span>
                  <button 
                    disabled
                    className="h-8 px-4 flex items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
                  >
                    Subscribed
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{userPlan.plan.description}</p>
                <p className="text-sm text-muted-foreground">
                  Up to {userPlan.plan.max_usage} lookups per month
                </p>
              </div>
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
                    {userPlan?.plan_id === plan.id ? (
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
