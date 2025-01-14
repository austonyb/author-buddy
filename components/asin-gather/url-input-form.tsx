'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UrlInputFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  usage: { used: number; limit: number } | null;
}

export function UrlInputForm({ onSubmit, isLoading, error, usage }: UrlInputFormProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(url)
    setUrl('')
  }

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
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com/data"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Fetching...' : 'Fetch Product Data'}
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
  )
}
