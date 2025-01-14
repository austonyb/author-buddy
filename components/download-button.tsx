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
    XLSX.writeFile(wb, filename);
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