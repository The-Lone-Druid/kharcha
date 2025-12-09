"use client";

import { useEffect, useState } from "react";

import { parseDate } from "chrono-node";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  initialValue?: Date | undefined;
  onChange?: (value: Date | undefined) => void;
}

const DatePickerWithNaturalLanguage = ({ initialValue, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => {
    if (initialValue) {
      return formatDate(initialValue);
    }
    return formatDate(new Date());
  });
  const [date, setDate] = useState<Date | undefined>(() => {
    if (initialValue) {
      return initialValue;
    }
    return parseDate("today") || undefined;
  });
  const [month, setMonth] = useState<Date | undefined>(date);

  useEffect(() => {
    onChange?.(date);
  }, [date, onChange]);

  return (
    <div className="w-full space-y-2">
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={value}
          placeholder="Tomorrow or next week"
          className="bg-background pr-10"
          onChange={(e) => {
            setValue(e.target.value);
            const date = parseDate(e.target.value);

            if (date) {
              setDate(date);
              setMonth(date);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Pick a date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date);
                setValue(formatDate(date));
                setOpen(false);
              }}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="text-muted-foreground text-sm">
        Date Selected: <span className="font-medium">{formatDate(date)}</span>.
      </div>
    </div>
  );
};

export default DatePickerWithNaturalLanguage;
