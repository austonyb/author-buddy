"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// Strict URL pattern for Amazon author pages only
const AMAZON_URL_PATTERN = /^https:\/\/(www\.)?amazon\.(com|co\.uk|ca|de|fr|es|it|co\.jp|in)\/stores\/author\/[\w-]+\/?(allbooks)?(?:\?[^#]*)?$/;

const sanitizeErrorMessage = (error: string) => {
  // Generic error messages that don't expose internal details
  const errorMap: Record<string, string> = {
    '504': "The request timed out. Please try a URL with fewer products.",
    '408': "The request took too long. Please try again.",
    '401': "Please sign in to use this feature.",
    '403': "You don't have permission to access this resource.",
    'default': "An unexpected error occurred. Please try again."
  };
  
  return errorMap[error] || errorMap.default;
};

export function UrlInputForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validateUrl = (url: string): boolean => {
    if (!AMAZON_URL_PATTERN.test(url)) {
      setError("Please enter a valid Amazon author page URL");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const url = formData.get("url") as string;
      
      if (!validateUrl(url)) {
        setIsPending(false);
        return;
      }

      const supabase = createClient();
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError) {
        throw new Error('401');
      }

      if (!session?.access_token) {
        throw new Error('401');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const response = await fetch(
          "https://ictdjoiczpcthnkbedpz.supabase.co/functions/v1/asin-gather",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ 
              url: url.trim() // Sanitize input
            }),
            signal: controller.signal,
            credentials: 'omit' // Explicitly prevent sending cookies
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(response.status.toString());
        }

        await response.json();
        router.refresh();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error) {
          setError(sanitizeErrorMessage(error.message));
        } else {
          setError(sanitizeErrorMessage('default'));
        }
      }
    } catch (error) {
      console.error('Form error:', error);
      setError(sanitizeErrorMessage('default'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid w-full items-start gap-4">
          <Label htmlFor="url" className="sr-only">
            Author URL
          </Label>
          <div className="inline-flex items-center gap-2">
            <Input
              id="url"
              name="url"
              placeholder="https://www.amazon.com/stores/author/XXXXXXX/allbooks"
              pattern={AMAZON_URL_PATTERN.source}
              title="Please enter a valid Amazon author page URL"
              required
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}