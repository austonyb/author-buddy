'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ChevronDown } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import Spreadsheet from 'react-spreadsheet'
import { Skeleton } from "@/components/ui/skeleton"
import { DownloadButton } from "./download-button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { createClient } from '@/utils/supabase/client'
import { cn } from "@/lib/utils"

export default function UrlToCsvConverter() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [productData, setProductData] = useState<Array<{
    asin: string;
    author: string;
    rating: string;
    type: string;
    title: string;
    url: string;
    price: number | string;
  }>>([])
  const [csvUrl, setCsvUrl] = useState<string | null>(null)
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null)

  // Transform product data for spreadsheet
  const spreadsheetData = productData.map(product => [
    { value: product.asin },
    { value: product.author },
    { value: product.title },
    { value: product.rating },
    { value: product.type },
    { value: product.price.toString() },
    { value: product.url }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setCsvUrl(null)

    try {
      if (!url.trim()) {
        throw new Error('Please enter a valid URL')
      }

      const supabase = createClient()
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error('Authentication error. Please sign in again.')
      }

      if (!session) {
        throw new Error('No active session. Please sign in.')
      }

      const { data, error: functionError } = await supabase.functions.invoke('asin-gather', {
        body: { url },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch product data')
      }

      if (!data || !data.products) {
        throw new Error('Invalid response from server')
      }

      setProductData(data.products)
      setIsOpen(true) // Auto-open the results section
      toast.success('Product data fetched successfully')
      
      window.dispatchEvent(new Event('recordsUpdated'))
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setUrl('')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Amazon URL to Product Data Generator</CardTitle>
            <CardDescription>
              Enter an author&apos;s Amazon page URL to get their books as product data
            </CardDescription>
          </div>
          {usage && (
            <div className="text-sm font-medium text-muted-foreground">
              Usage: {usage.used} / {usage.limit} requests
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
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

        {(productData.length > 0 || isLoading) && (
          <Collapsible className="rounded-md border" open={isOpen} onOpenChange={setIsOpen}>
            <div className="px-4 py-2 flex items-start justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-start gap-2">
                  View Results {productData.length > 0 && `(${productData.length} rows)`}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              {csvUrl && !isLoading && (
                <DownloadButton url={csvUrl} />
              )}
            </div>
            <CollapsibleContent>
              {isLoading ? (
                <div className="p-4">
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : productData.length > 0 ? (
                <div className="p-4 overflow-auto">
                  <div className="[&_.Spreadsheet]:w-full [&_.Spreadsheet]:border-none [&_.Spreadsheet]:bg-background [&_.Spreadsheet__header]:bg-muted [&_.Spreadsheet__cell]:border-border [&_.Spreadsheet__cell]:bg-background [&_.Spreadsheet__cell]:text-foreground [&_.Spreadsheet__cell--selected]:!bg-primary/20 [&_.Spreadsheet__cell--readonly]:!bg-muted">
                    <Spreadsheet
                      data={spreadsheetData}
                      columnLabels={['ASIN', 'Author', 'Title', 'Rating', 'Type', 'Price', 'URL']}
                      darkMode={true}
                      rowLabels={productData.map((_, i) => (i + 1).toString())}
                    />
                  </div>
                </div>
              ) : null}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}