import UrlToCsvConverter from "@/components/url-to-csv-converter";
import { PreviousRecords } from "@/components/previous-records";

export default async function AsinGather() {
    return (
      <>
        <UrlToCsvConverter />
        <div className="mt-8">
          <PreviousRecords />
        </div>
      </>
    );
  }