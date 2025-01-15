"use client";

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ResultsDisplay } from "./asin-gather/results-display";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Download {
  id: number;
  created_at: string;
  data: ProductData[];
}

export function PreviousRecords({ downloads }: { downloads: Download[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDownload, setSelectedDownload] = useState<Download | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const recordsPerPage = 10;

  const paginatedDownloads = downloads.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const totalPages = Math.ceil(downloads.length / recordsPerPage);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <h3 className="text-md font-semibold">Previous downloads</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {paginatedDownloads.map((download) => (
          <Card
            key={download.id}
            className={`p-4 cursor-pointer transition-colors hover:bg-muted`}
            onClick={() => {
              setSelectedDownload(download);
              setOpen(true);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {download.data[0]?.author || "Unknown Author"} -{" "}
                  {download.data.length} books
                </span>
              </div>
              <span>
                {new Date(download.created_at).toLocaleString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}
              </span>
            </div>
          </Card>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="py-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Are you absolutely sure?</SheetTitle>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[500px]">
            <ResultsDisplay
              productData={selectedDownload?.data || []}
              selectedType="all"
              onTypeChange={() => {}}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
