"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { fetchProductData } from "@/lib/actions";

export function UrlInputForm() {
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
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {state?.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}