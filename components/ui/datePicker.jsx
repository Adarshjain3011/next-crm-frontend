'use client';

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react"; // XIcon for clear button
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function DatePicker({ date, onChange,setDate }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={"w-[200px] justify-start text-left font-normal"}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
        />
        {date && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full flex items-center justify-center gap-2 text-red-500"
            onClick={() => onChange(undefined)}
          >
            <XIcon className="h-4 w-4" />
            Clear Date
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
