'use client'

import { useEffect, useState } from "react";
import { DownloadButton } from "./download-button";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PreviousRecords() {
  const [records, setRecords] = useState<ScrapeRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchRecords = async () => {
    const response = await fetch('/api/session');
    const data = await response.json();
    if (data.records) {
      setRecords(data.records);
    }
  };

  useEffect(() => {
    fetchRecords();

    // Listen for record updates
    const handleRecordUpdate = () => {
      fetchRecords();
    };

    window.addEventListener('recordsUpdated', handleRecordUpdate);
    return () => {
      window.removeEventListener('recordsUpdated', handleRecordUpdate);
    };
  }, []);

  const paginatedRecords = [...records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const totalPages = Math.ceil(records.length / recordsPerPage);

  return (
    <Card className="w-full max-w-4xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Previous Downloads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paginatedRecords.map((record) => (
          <Card key={record.id} className="p-4">
            <div className="flex items-center justify-between">
              <DownloadButton url={record.url} />
              <span>{new Date(record.createdAt).toLocaleString('en-US', {
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
