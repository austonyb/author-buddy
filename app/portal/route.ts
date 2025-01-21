/* eslint-disable */
// @ts-nocheck - Polar types need updating

import { CustomerPortal } from "@polar-sh/nextjs";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? '',
  getCustomerId: async (req) => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error("User not authenticated");
    }

    // Get the user's Polar customer ID from their plan
    const { data: userPlan, error: planError } = await supabase
      .from('user_plans')
      .select(`
        polar_customer_id,
        plan:plans (
          name
        )
      `)
      .eq('user_id', user.id)
      .is('end_date', null)
      .order('start_date', { ascending: false })
      .limit(1)
      .single();
    
    if (planError) {
      console.error("Error fetching user plan:", planError);
      throw new Error("Error fetching user plan");
    }

    if (!userPlan?.polar_customer_id) {
      console.error("No Polar customer ID found for user:", user.id);
      // Redirect to pricing page or show error
      throw new Error("No active subscription found");
    }
    
    return userPlan.polar_customer_id;
  },
  onError: (error: Error) => {
    console.error("Customer Portal Error:", error);
    return NextResponse.json(
      { error: "Failed to create customer portal session" },
      { status: 500 }
    );
  }
});