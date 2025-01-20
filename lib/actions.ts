"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchProductData(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: "Please sign in to use this feature" };
    }

    const url = formData.get("url") as string;
    const response = await fetch(
      "https://ictdjoiczpcthnkbedpz.supabase.co/functions/v1/asin-gather",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "Failed to fetch product data" };
    }

    const data = await response.json();
    revalidatePath("/tools/asin-gather");
    return { data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Error fetching product data" };
  }
}
