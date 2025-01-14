'use client'

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

export interface DownloadButtonProps {
  data: Array<{
    asin: string;
    author: string;
    rating: string;
    type: string;
    title: string;
    url: string;
    price: number | string;
  }>;
  filename?: string;
}

export function DownloadButton({ data, filename = 'product-data.xlsx' }: DownloadButtonProps) {
  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    
    // Get unique authors from the data
    const authors = Array.from(new Set(data.map(item => item.author)));
    const authorName = authors[0] || 'unknown';
    
    // Use the provided timestamp
    const date = '2025-01-13';
    
    // Create the filename with author name and date
    const downloadFilename = `${authorName}-${date}.xlsx`;
    
    XLSX.writeFile(wb, downloadFilename);
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
    >
      <Download className="mr-2 h-4 w-4" />
      Download Excel
    </Button>
  );
}