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

export default function UrlToCsvConverter() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csvData, setCsvData] = useState<string[][]>([])
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

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type');
        let errorMessage;
        
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error;
        } else {
          errorMessage = await response.text();
        }
        
        throw new Error(errorMessage || 'Failed to convert URL to CSV');
      }

      const usageCount = parseInt(response.headers.get('X-Usage-Count') || '0')
      const usageLimit = parseInt(response.headers.get('X-Usage-Limit') || '0')
      setUsage({ used: usageCount, limit: usageLimit })

      const csvText = await response.text()
      const rows = csvText.split('\n').map(row => row.split(','))
      setCsvData(rows)
      setCsvUrl(response.headers.get('X-Download-Url'))
      toast.success('CSV file generated successfully')
      
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
            <CardTitle>Amazon URL to ASIN CSV Generator</CardTitle>
            <CardDescription>
              Enter an author&apos;s Amazon page URL to get their books as ASINs
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
              {isLoading ? 'Converting...' : 'Convert to CSV'}
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

        {(csvData.length > 0 || isLoading) && (
          <Collapsible className="rounded-md border">
            <div className="px-4 py-2 flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  View Results {csvData.length > 0 && `(${csvData.length - 1} rows)`}
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
                    {csvData[0]?.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Array.from({ length: csvData[0]?.length || 3 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    csvData.slice(1).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {cell.startsWith('http') ? (
                              <a 
                                href={cell}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {cell}
                              </a>
                            ) : cell}
                          </TableCell>
                        ))}
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