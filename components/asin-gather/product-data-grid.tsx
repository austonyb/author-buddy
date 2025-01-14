'use client'

import Spreadsheet from 'react-spreadsheet'
import { useTheme } from 'next-themes'

interface ProductDataGridProps {
  data: ProductData[];
}

export function ProductDataGrid({ data }: ProductDataGridProps) {
  const { resolvedTheme } = useTheme()
  console.log('Resolved theme:', resolvedTheme)
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
    <div className="overflow-auto [&_.Spreadsheet]:w-full [&_.Spreadsheet]:border-none [&_.Spreadsheet__header]:!bg-background [&_.Spreadsheet__cell]:!border-border [&_.Spreadsheet__cell]:!bg-background [&_.Spreadsheet__cell]:!text-foreground hover:[&_.Spreadsheet__cell]:!bg-muted/50 [&_.Spreadsheet__cell--selected]:!bg-primary/20 [&_.Spreadsheet__header-cell]:!text-muted-foreground [&_.Spreadsheet__header-cell]:!bg-background">
      <Spreadsheet
        data={spreadsheetData}
        columnLabels={['ASIN', 'Author', 'Title', 'Rating', 'Type', 'Price', 'URL']}
        darkMode={resolvedTheme === 'dark'}
        rowLabels={data.map((_, i) => (i + 1).toString())}
        onChange={() => {}}
      />
    </div>
  )
}
