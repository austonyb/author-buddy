import { Suspense } from 'react';
import UrlToCsvConverter from "@/components/url-to-csv-converter";
import { PreviousRecords } from "@/components/previous-records";

export default async function AsinGather() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Amazon Product Data Gatherer</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <UrlToCsvConverter />
        <div className="mt-8">
          <PreviousRecords />
        </div>
      </Suspense>
    </div>
  );
}