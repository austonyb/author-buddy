import { UrlInputForm } from "@/components/asin-gather/url-input-form";
import { PreviousRecords } from "@/components/previous-records";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.error("No authenticated session found");
    return;
  }

  const { data: downloads, error } = await supabase
    .from("downloads")
    .select("id, created_at, data")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching downloads:", error);
    return;
  }

  return (
    <div className="flex w-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-14 items-center gap-4 border-b px-6 bg-background sticky top-0 z-20 shadow-sm">
          <h1 className="text-lg font-semibold">Gather all ASINs by Author</h1>
        </header>
        <main className="flex-1 overflow-auto px-4 py-2">
          <UrlInputForm usage={null} />
          <PreviousRecords downloads={downloads} />
        </main>
      </div>
    </div>
  );
}
