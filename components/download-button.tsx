'use client'

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  url: string;
}

export function DownloadButton({ url }: DownloadButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => window.open(url, "_blank")}
    >
      <Download className="mr-2 h-4 w-4" />
      Download CSV
    </Button>
  );
} 