'use client'

import { Button } from "@/components/ui/button"
import { ChevronDown } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { DownloadButton } from "../download-button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { ProductTypeFilter } from './product-type-filter'
import { ProductDataGrid } from './product-data-grid'

interface ResultsDisplayProps {
  isLoading: boolean;
  productData: ProductData[];
  selectedType: string;
  onTypeChange: (type: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResultsDisplay({ 
  isLoading, 
  productData, 
  selectedType, 
  onTypeChange,
  isOpen,
  onOpenChange
}: ResultsDisplayProps) {
  const filteredProductData = selectedType === 'all' 
    ? productData 
    : productData.filter(product => product.type === selectedType)

  if (productData.length === 0 && !isLoading) return null

  return (
    <Collapsible className="rounded-md border" open={isOpen} onOpenChange={onOpenChange}>
      <div className="px-4 py-2 flex items-start justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-start gap-2">
            View Results {productData.length > 0 && `(${productData.length} rows)`}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        {productData.length > 0 && !isLoading && (
          <DownloadButton data={filteredProductData} />
        )}
      </div>
      <CollapsibleContent>
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : productData.length > 0 ? (
          <div className="p-4">
            <ProductTypeFilter 
              productData={productData}
              selectedType={selectedType}
              onTypeChange={onTypeChange}
            />
            <ProductDataGrid data={filteredProductData} />
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}
