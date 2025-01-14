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
}

export default function AsinGather() {
  const [resultsState, setResultsState] = useState<SharedResultsState>({
    isOpen: false,
    productData: [],
    selectedType: 'all'
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
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-4xl font-bold">Amazon Product Data Gatherer</h1>
      
      <AnimatePresence mode="wait">
        {!resultsState.isOpen && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ResultsDisplay
              isOpen={resultsState.isOpen}
              onOpenChange={(isOpen) => handleResultsChange({ isOpen })}
              productData={resultsState.productData}
              selectedType={resultsState.selectedType}
              onTypeChange={(selectedType) => handleResultsChange({ selectedType })}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <PreviousRecords
        ref={previousRecordsRef}
        onResultsChange={handleResultsChange}
        resultsState={resultsState}
      />
    </div>
  );
}