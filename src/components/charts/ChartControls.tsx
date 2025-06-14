
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type Timeframe = '1h' | '1d' | '7d' | '30d' | '1y' | 'all';

interface ChartControlsProps {
  timeframe: Timeframe;
  setTimeframe: (timeframe: Timeframe) => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({ timeframe, setTimeframe }) => {
  return (
    <div className="flex justify-end mb-4">
      <ToggleGroup
        type="single"
        defaultValue="7d"
        value={timeframe}
        onValueChange={(value: Timeframe) => {
          if (value) setTimeframe(value);
        }}
        aria-label="Chart timeframe"
      >
        <ToggleGroupItem value="1h" aria-label="1 hour">1H</ToggleGroupItem>
        <ToggleGroupItem value="1d" aria-label="1 day">1D</ToggleGroupItem>
        <ToggleGroupItem value="7d" aria-label="7 days">7D</ToggleGroupItem>
        <ToggleGroupItem value="30d" aria-label="30 days">30D</ToggleGroupItem>
        <ToggleGroupItem value="1y" aria-label="1 year">1Y</ToggleGroupItem>
        <ToggleGroupItem value="all" aria-label="All time">All</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default ChartControls;
