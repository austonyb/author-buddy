'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UrlInputForm } from "@/components/asin-gather/url-input-form"
import { PreviousRecords } from "@/components/previous-records"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

interface SidebarProps {
  onResultsChange: (newState: Partial<SharedResultsState>) => void;
  resultsState: SharedResultsState;
  onSubmitSuccess: () => void;
  previousRecordsRef: React.RefObject<{
    revalidate: () => void;
  } | null>;
  className: string;
}

export function AppSidebar({ 
  onResultsChange, 
  resultsState, 
  onSubmitSuccess,
  previousRecordsRef,
  className 
}: SidebarProps) {
  const onSubmit = async (url: string) => {
    onResultsChange({ isLoading: true });
    try {
      // Your existing submit logic here
      onSubmitSuccess();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      onResultsChange({ isLoading: false });
    }
  }

  return (
    <Sidebar className={className}>
      <SidebarHeader className="flex justify-end">
        <SidebarTrigger className="hover:bg-muted/50 p-2 rounded-md" />
      </SidebarHeader>
      <SidebarContent>
        <div className="p-4 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-md font-semibold">Enter an Amazon author URL</h3>
            </CardHeader>
            <CardContent>
              <UrlInputForm 
                onSubmit={onSubmit} 
                isLoading={resultsState.isLoading} 
                error={null} 
                usage={null}
              />
            </CardContent>
          </Card>
          <div className="flex flex-col h-[calc(100vh-14rem)]">
            <div className="flex-1 overflow-y-auto -mx-4 px-4 pb-6">
              <PreviousRecords 
                ref={previousRecordsRef}
                onResultsChange={onResultsChange}
                resultsState={resultsState}
              />
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
