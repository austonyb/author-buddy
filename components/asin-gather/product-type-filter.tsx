"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface ProductTypeFilterProps {
  productData: ProductData[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function ProductTypeFilter({
  productData,
  selectedType,
  onTypeChange,
}: ProductTypeFilterProps) {
  const uniqueTypes = Array.from(new Set(productData.map((p) => p.type)));

  return (
    <div className="mb-4">
      <Label htmlFor="type-filter" className="sr-only">
        Filter by Type
      </Label>
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger id="type-filter" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {uniqueTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
