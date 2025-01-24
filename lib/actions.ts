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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(
        "https://ictdjoiczpcthnkbedpz.supabase.co/functions/v1/asin-gather",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ url }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 504) {
          return { error: "The request timed out. The URL may contain too much data to process. Try a URL with fewer products." };
        }
        return { error: `Server error: ${response.status}` };
      }

      const data = await response.json();
      revalidatePath("/tools/asin-gather");
      return { data };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { error: "The request took too long to complete. Please try again with a URL containing fewer products." };
      }
      throw error; // Re-throw other errors to be caught by outer catch
    }
  } catch (error: any) {
    console.error('Fetch error:', error);
    return { error: "An error occurred while processing your request. Please try again." };
  }
}
