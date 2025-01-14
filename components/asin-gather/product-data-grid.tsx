'use client'

import Spreadsheet from 'react-spreadsheet'

interface ProductDataGridProps {
  data: ProductData[];
}

export function ProductDataGrid({ data }: ProductDataGridProps) {
  const spreadsheetData = data.map(product => [
    { value: product.asin },
    { value: product.author },
    { value: product.title },
    { value: product.rating },
    { value: product.type },
    { value: product.price.toString() },
    { value: product.url }
  ])

  return (
    <div className="overflow-auto [&_.Spreadsheet]:w-full [&_.Spreadsheet]:border-none [&_.Spreadsheet__header]:!bg-muted [&_.Spreadsheet__cell]:!border-border [&_.Spreadsheet__cell]:!bg-card [&_.Spreadsheet__cell]:!text-card-foreground hover:[&_.Spreadsheet__cell]:!bg-muted/50 [&_.Spreadsheet__cell--selected]:!bg-primary/20 [&_.Spreadsheet__header-cell]:!text-muted-foreground [&_.Spreadsheet__header-cell]:!bg-muted">
      <Spreadsheet
        data={spreadsheetData}
        columnLabels={['ASIN', 'Author', 'Title', 'Rating', 'Type', 'Price', 'URL']}
        darkMode={false}
        rowLabels={data.map((_, i) => (i + 1).toString())}
        onChange={() => {}}
      />
    </div>
  )
}
