"use client";

import { ProductTypeFilter } from "./product-type-filter";
import { ProductDataGrid } from "./product-data-grid";
import { DownloadButton } from "../download-button";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsDisplayProps {
  productData: ProductData[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function ResultsDisplay({
  productData,
  selectedType,
  onTypeChange,
}: ResultsDisplayProps) {
  const filteredProductData =
    selectedType === "all"
      ? productData
      : productData.filter((product) => product.type === selectedType);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <ProductTypeFilter
          productData={productData}
          selectedType={selectedType}
          onTypeChange={onTypeChange}
        />
        {productData.length > 0 && (
          <DownloadButton data={filteredProductData} />
        )}
      </div>
      {productData.length > 0 ? (
        <ProductDataGrid data={filteredProductData} />
      ) : (
        <Skeleton className="h-[500px] w-full" />
      )}
    </div>
  );
}
