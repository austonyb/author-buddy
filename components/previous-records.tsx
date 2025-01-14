'use client'

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client";

interface Download {
  id: number;
  created_at: string;
  data: ProductData[];
}

interface PreviousRecordsProps {
  onResultsChange: (state: { isOpen: boolean; productData: ProductData[]; selectedType: string }) => void;
  resultsState: {
    isOpen: boolean;
    productData: ProductData[];
    selectedType: string;
  };
}

export const PreviousRecords = forwardRef<{ revalidate: () => void }, PreviousRecordsProps>(
  function PreviousRecords({ onResultsChange, resultsState }, ref) {
    const [downloads, setDownloads] = useState<Download[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const fetchDownloads = async () => {
      const supabase = createClient();
      const { data: downloads, error } = await supabase
        .from('downloads')
        .select('id, created_at, data')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching downloads:', error);
        return;
      }

      setDownloads(downloads || []);
    };

    useImperativeHandle(ref, () => ({
      revalidate: fetchDownloads
    }));

    useEffect(() => {
      fetchDownloads();
    }, []);

    const paginatedDownloads = downloads
      .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    const totalPages = Math.ceil(downloads.length / recordsPerPage);

    const handleDownloadSelect = (download: Download) => {
      onResultsChange({
        isOpen: true,
        productData: download.data,
        selectedType: 'all'
      });
    };

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Previous Downloads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paginatedDownloads.map((download) => (
            <Card 
              key={download.id} 
              className={`p-4 cursor-pointer transition-colors hover:bg-muted ${
                resultsState.productData === download.data ? 'bg-muted' : ''
              }`}
              onClick={() => handleDownloadSelect(download)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {download.data.length} products
                  </span>
                </div>
                <span>{new Date(download.created_at).toLocaleString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</span>
              </div>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="py-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
