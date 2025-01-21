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
      .select('polar_customer_id')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
      .limit(1)
      .single();
    
    if (planError || !userPlan?.polar_customer_id) {
      throw new Error("No active plan found with Polar customer ID");
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