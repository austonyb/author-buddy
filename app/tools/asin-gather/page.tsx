'use client'

import { useState, useRef } from 'react'
import { AppSidebar } from '@/components/asin-gather/sidebar'
import { ResultsDisplay } from '@/components/asin-gather/results-display'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'

export default function AsinGather() {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="flex h-screen w-full overflow-hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-4 top-4">
            <span className="sr-only">Toggle sidebar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[400px] sm:w-[540px] p-0">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle>ASIN Gather</SheetTitle>
          </SheetHeader>
          <AppSidebar
            onResultsChange={handleResultsChange}
            resultsState={resultsState}
            onSubmitSuccess={handleSubmitSuccess}
            previousRecordsRef={previousRecordsRef}
            className="h-full"
          />
        </SheetContent>
      </Sheet>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-14 items-center gap-4 border-b px-6 bg-background sticky top-0 z-20 shadow-sm">
          <h1 className="text-lg font-semibold">Gather all ASINs by Author</h1>
        </header>
        <main className="flex-1 overflow-auto px-4 py-2">
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
  )
}
