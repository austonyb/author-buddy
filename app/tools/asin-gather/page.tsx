'use client'

import { useState, useRef } from 'react'
import { AppSidebar } from '@/components/asin-gather/sidebar'
import { ResultsDisplay } from '@/components/asin-gather/results-display'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { motion } from 'framer-motion'

export default function AsinGather() {
  const [resultsState, setResultsState] = useState<SharedResultsState>({
    isOpen: false,
    productData: [],
    selectedType: 'all',
    isLoading: false
  });

  const previousRecordsRef = useRef<{
    revalidate: () => void
  } | null>(null);

  const handleResultsChange = (newState: Partial<SharedResultsState>) => {
    setResultsState(prev => ({ ...prev, ...newState }));
  };

  const handleSubmitSuccess = () => {
    previousRecordsRef.current?.revalidate();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar
          onResultsChange={handleResultsChange}
          resultsState={resultsState}
          onSubmitSuccess={handleSubmitSuccess}
          previousRecordsRef={previousRecordsRef}
          className="flex-shrink-0"
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex h-14 items-center gap-4 border-b px-6 bg-background sticky top-0 z-20 shadow-sm">
            <h1 className="text-lg font-semibold">Gather all ASINs by Author</h1>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <motion.div
              layout
              transition={{
                layout: { duration: 0.3 }
              }}
              className="h-full"
            >
              <ResultsDisplay
                isOpen={true}
                onOpenChange={() => {}}
                productData={resultsState.productData}
                selectedType={resultsState.selectedType}
                onTypeChange={(selectedType) => handleResultsChange({ selectedType })}
                isLoading={resultsState.isLoading}
              />
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
