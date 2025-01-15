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
import { createClient } from '@/utils/supabase/client'

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
  const supabase = createClient()

  const onSubmit = async (url: string) => {
    onResultsChange({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Please sign in to use this feature');
      }

      const response = await fetch('https://ictdjoiczpcthnkbedpz.supabase.co/functions/v1/asin-gather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch product data');
      }

      const data = await response.json();
      onResultsChange({ 
        productData: data.products,
        selectedType: 'all',
        isLoading: false 
      });
      onSubmitSuccess();
    } catch (error) {
      console.error('Error:', error);
      onResultsChange({ 
        productData: [],
        isLoading: false 
      });
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
