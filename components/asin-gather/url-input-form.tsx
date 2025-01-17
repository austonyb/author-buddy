"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useActionState } from "react";
import { fetchProductData } from "@/lib/actions";
import { Send } from "lucide-react";

interface UrlInputFormProps {
  usage: {
    monthly_usage: number;
    last_reset: string;
    last_usage: string | null;
  } | null;
  maxUsage: number | null;
}

export function UrlInputForm({ usage, maxUsage }: UrlInputFormProps) {
  const [state, formAction, isPending] = useActionState(fetchProductData, null);

  return (
    <div>
      <form action={formAction} className="mb-6">
        <div className="grid w-full items-start gap-4">
          <Label htmlFor="url" className="sr-only">
            Author URL
          </Label>
          <div className="inline-flex items-center gap-2">
            <Input
              id="url"
              name="url"
              placeholder="https://www.amazon.com/stores/author/XXXXXXX/allbooks"
              pattern="https?:\/\/[^\s]+"
              required
            />
            <Button type="submit" disabled={isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-2 mb-4">
        {usage && maxUsage && (
          <>
            <div className="text-sm font-medium text-muted-foreground flex justify-between">
              <span>Usage this month</span>
              <span>{usage.monthly_usage} / {maxUsage} requests</span>
            </div>
            <Progress value={(usage.monthly_usage / maxUsage) * 100} className="h-2" />
          </>
        )}
      </div>

      {state?.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
