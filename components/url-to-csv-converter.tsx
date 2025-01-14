'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createClient } from '@/utils/supabase/client'
import { UrlInputForm } from './asin-gather/url-input-form'

interface UrlToCsvConverterProps {
  onResultsChange: (state: { isOpen: boolean; productData: ProductData[]; selectedType: string; isLoading: boolean }) => void;
  resultsState: {
    isOpen: boolean;
    productData: ProductData[];
    selectedType: string;
    isLoading: boolean;
  };
  onSubmitSuccess?: () => void;
}

export default function UrlToCsvConverter({ onResultsChange, resultsState, onSubmitSuccess }: UrlToCsvConverterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null)

  const handleSubmit = async (url: string) => {
    setIsLoading(true)
    onResultsChange({ ...resultsState, isLoading: true })
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

      onResultsChange({
        isOpen: true,
        productData: data.products,
        selectedType: 'all',
        isLoading: false
      })

      // Notify parent of successful submission
      onSubmitSuccess?.()
      
      // Dispatch event to update records list
      window.dispatchEvent(new Event('recordsUpdated'))
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      onResultsChange({ ...resultsState, isLoading: false })
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription className='font-semibold'>
          Enter an author's Amazon page URL to get their books as product data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UrlInputForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
          error={error}
          usage={usage}
        />
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
        {usage && (
          <p className="text-sm text-gray-500 mt-2">
            Usage: {usage.used}/{usage.limit}
          </p>
        )}
      </CardContent>
    </Card>
  )
}