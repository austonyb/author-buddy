'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { UrlInputForm } from './asin-gather/url-input-form'
// import type { ProductData } from '@/lib/types'

// interface UrlToCsvConverterProps {
//   onResultsChange: (state: { isOpen: boolean; productData: ProductData[]; selectedType: string; isLoading: boolean }) => void;
//   resultsState: {
//     isOpen: boolean;
//     productData: ProductData[];
//     selectedType: string;
//     isLoading: boolean;
//   };
//   onSubmitSuccess?: () => void;
// }

export default function UrlToCsvConverter() {
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)
  const [usage] = useState<{ used: number; limit: number } | null>(null)

  console.log(isLoading)

  return (
    <Card>
      <CardHeader>
        <CardDescription className='font-semibold'>
          Enter an author&apos;s Amazon page URL to get their books as product data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UrlInputForm />
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