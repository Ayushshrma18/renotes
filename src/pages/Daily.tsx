
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

const Daily = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
      <div className="glass-card p-4 rounded-lg h-fit">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
        />
      </div>
      <div className="glass-card p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">
          {date?.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>
        <div className="prose prose-invert max-w-none">
          <p>Select a date to view or create notes.</p>
        </div>
      </div>
    </div>
  );
};

export default Daily;
