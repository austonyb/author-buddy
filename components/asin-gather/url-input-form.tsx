"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useActionState } from "react";
import { fetchProductData } from "@/lib/actions";
import { Send } from "lucide-react";

interface UrlInputFormProps {
  usage: { used: number; limit: number } | null;
}

export function UrlInputForm({ usage }: UrlInputFormProps) {
  const [state, formAction, isPending] = useActionState(fetchProductData, null);

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        {usage && (
          <div className="text-sm font-medium text-muted-foreground">
            Usage: {usage.used} / {usage.limit} requests
          </div>
        )}
      </div>

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
