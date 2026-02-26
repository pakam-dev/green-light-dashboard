import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, ChevronDown } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ReportFilters as Filters, PRESET_RANGES } from "@/hooks/useReportFilters";
import { useGetLocationsQuery } from "@/store/api/reportsApi";

interface ReportFiltersProps {
  filters: Filters;
  onUpdate: (updates: Partial<Filters>) => void;
}

const ALL_LOCATIONS_OPTION = { value: "all", label: "All Locations" };

export const ReportFiltersBar = ({ filters, onUpdate }: ReportFiltersProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { data: locationsRes } = useGetLocationsQuery();
  const locations = [
    ALL_LOCATIONS_OPTION,
    ...(locationsRes?.data ?? []),
  ];
  const [range, setRange] = useState<DateRange | undefined>({
    from: filters.from,
    to: filters.to,
  });

  const applyRange = () => {
    if (range?.from && range?.to) {
      onUpdate({ from: range.from, to: range.to });
    }
    setCalendarOpen(false);
  };

  const applyPreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days + 1);
    onUpdate({ from, to });
    setRange({ from, to });
    setCalendarOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date range picker */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 h-9 text-sm font-normal">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(filters.from, "MMM d, yyyy")} – {format(filters.to, "MMM d, yyyy")}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex" align="start">
          {/* Preset shortcuts */}
          <div className="flex flex-col border-r border-border py-3 px-2 gap-0.5 min-w-[130px]">
            {PRESET_RANGES.map((preset) => (
              <button
                key={preset.days}
                onClick={() => applyPreset(preset.days)}
                className="text-left text-sm px-3 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
              className="rounded-md"
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-border mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalendarOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={applyRange}
                disabled={!range?.from || !range?.to}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Location filter */}
      <Select
        value={filters.location}
        onValueChange={(value) => onUpdate({ location: value })}
      >
        <SelectTrigger className="h-9 w-[180px] text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
          <SelectValue placeholder="All Locations" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((loc) => (
            <SelectItem key={loc.value} value={loc.value}>
              {loc.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
