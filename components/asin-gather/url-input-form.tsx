"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/utils/supabase/client";

interface UrlInputFormProps {
  usage: { used: number; limit: number } | null;
}

export function UrlInputForm({ usage }: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const onSubmit = async (url: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please sign in to use this feature");
      }

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
        throw new Error(errorData.error || "Failed to fetch product data");
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(url);
    setUrl("");
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        {usage && (
          <div className="text-sm font-medium text-muted-foreground">
            Usage: {usage.used} / {usage.limit} requests
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid w-full items-start gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="url">Author URL</Label>
            <Input
              id="url"
              placeholder="https://www.amazon.com/stores/author/XXXXXXX/allbooks"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Fetching..." : "Fetch Product Data"}
          </Button>
        </div>
      </form>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
