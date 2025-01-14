'use client'

import { Suspense } from 'react';
import UrlToCsvConverter from "@/components/url-to-csv-converter";
import { PreviousRecords } from "@/components/previous-records";
import { useState, useRef } from 'react';
import { ResultsDisplay } from '@/components/asin-gather/results-display';
import { AnimatePresence, motion } from 'framer-motion';

interface SharedResultsState {
  isOpen: boolean;
  productData: ProductData[];
  selectedType: string;
  isLoading: boolean;
}

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
    // Trigger revalidation of previous records
    previousRecordsRef.current?.revalidate()
  };

  return (
    <motion.div 
      className="container mx-auto py-10 space-y-8"
      layout
      transition={{
        layout: { duration: 0.3, ease: "easeInOut" }
      }}
    >
      <motion.h1 
        className="text-4xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Gather all ASINs by Author
      </motion.h1>
      
      <AnimatePresence mode="wait">
        {!resultsState.isOpen && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
            layout
          >
            <UrlToCsvConverter
              onResultsChange={handleResultsChange}
              resultsState={resultsState}
              onSubmitSuccess={handleSubmitSuccess}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {resultsState.isOpen && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
            layout
          >
            <ResultsDisplay
              isOpen={resultsState.isOpen}
              onOpenChange={(isOpen) => handleResultsChange({ isOpen })}
              productData={resultsState.productData}
              selectedType={resultsState.selectedType}
              onTypeChange={(selectedType) => handleResultsChange({ selectedType })}
              isLoading={resultsState.isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        transition={{
          layout: { duration: 0.3, ease: "easeInOut" }
        }}
      >
        <PreviousRecords
          ref={previousRecordsRef}
          onResultsChange={handleResultsChange}
          resultsState={resultsState}
        />
      </motion.div>
    </motion.div>
  );
}