'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createClient } from '@/utils/supabase/client'
import { UrlInputForm } from './asin-gather/url-input-form'
import { ResultsDisplay } from './asin-gather/results-display'

export default function UrlToCsvConverter() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [productData, setProductData] = useState<ProductData[]>([])
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null)
  const [selectedType, setSelectedType] = useState<string>('all')

  const handleSubmit = async (url: string) => {
    setIsLoading(true)
    setError(null)

    try {
      if (!url.trim()) {
        throw new Error('Please enter a valid URL')
      }

      const supabase = createClient()
      
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
      setIsOpen(true)
      toast.success('Product data fetched successfully')
      
      window.dispatchEvent(new Event('recordsUpdated'))
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Amazon URL to Product Data Generator</CardTitle>
        <CardDescription>
          Enter an author&apos;s Amazon page URL to get their books as product data
        </CardDescription>
        {usage && (
          <div className="text-sm font-medium text-muted-foreground">
            Usage: {usage.used} / {usage.limit} requests
          </div>
        )}
      </CardHeader>
      <CardContent>
        <UrlInputForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          usage={usage}
        />

        <ResultsDisplay
          isLoading={isLoading}
          productData={productData}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      </CardContent>
    </Card>
  )
}