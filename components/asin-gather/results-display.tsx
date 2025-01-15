'use client'

import { Search } from "lucide-react"
import { ProductTypeFilter } from './product-type-filter'
import { ProductDataGrid } from './product-data-grid'
import { DownloadButton } from "../download-button"
import { Skeleton } from "@/components/ui/skeleton"

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
  onTypeChange
}: ResultsDisplayProps) {
  const filteredProductData = selectedType === 'all' 
    ? productData 
    : productData.filter(product => product.type === selectedType)

  if (productData.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] space-y-4 text-center">
        <div className="rounded-full bg-muted/50 p-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No results to display</h3>
          <p className="text-sm text-muted-foreground max-w-[400px]">
            Enter an Amazon author URL in the sidebar to fetch their book data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <ProductTypeFilter 
          productData={productData}
          selectedType={selectedType}
          onTypeChange={onTypeChange}
        />
        {productData.length > 0 && !isLoading && (
          <DownloadButton data={filteredProductData} />
        )}
      </div>
      {isLoading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <ProductDataGrid data={filteredProductData} />
      )}
    </div>
  )
}
