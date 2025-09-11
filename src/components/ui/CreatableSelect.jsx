import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CreatableSelect({ options, value, onChange, placeholder, createLabel, className }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setOpen(false);
  };

  const filteredOptions = search
    ? options.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const showCreateOption = search && !filteredOptions.some(opt => opt.label.toLowerCase() === search.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {value
            ? options.find((option) => option.value === value)?.label || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <div className="p-2 border-b">
          <Input
            placeholder="Buscar ou criar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === option.value ? "opacity-100" : "opacity-0"
                )}
              />
              {option.label}
            </div>
          ))}
          {showCreateOption && (
             <div
              onClick={() => handleSelect(search)}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
            >
               <span className="mr-2 h-4 w-4"></span> {/* Espaçador */}
               {createLabel} "{search}"
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}