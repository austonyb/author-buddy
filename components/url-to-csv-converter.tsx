'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ChevronDown } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DownloadButton } from "./download-button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { createClient } from '@/utils/supabase/client'

export default function UrlToCsvConverter() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    <Card className="w-full max-w-4xl mx-auto mt-10">
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
          <div className="grid w-full items-center gap-4">
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
          <Collapsible className="rounded-md border">
            <div className="px-4 py-2 flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  View Results {productData.length > 0 && `(${productData.length} rows)`}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              {csvUrl && !isLoading && (
                <DownloadButton url={csvUrl} />
              )}
            </div>
            <CollapsibleContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ASIN</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Array.from({ length: 7 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    productData.map((product, rowIndex) => (
                      <TableRow key={rowIndex}>
                        <TableCell>{product.asin}</TableCell>
                        <TableCell>{product.title}</TableCell>
                        <TableCell>{product.author}</TableCell>
                        <TableCell>{product.rating}</TableCell>
                        <TableCell>{product.type}</TableCell>
                        <TableCell>{
                          !product.price || isNaN(parseFloat(product.price as string))
                            ? 'N/A'
                            : `$${typeof product.price === 'number' 
                                ? product.price.toFixed(2)
                                : parseFloat(product.price).toFixed(2)}`
                        }</TableCell>
                        <TableCell>
                          <a 
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {product.url}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}