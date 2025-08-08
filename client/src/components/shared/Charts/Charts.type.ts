// Define measurement type for reuse
type Measurement = {
  key: string;
  title: string;
  shortTitle: string;
  color: string;
};

// Define data type for the chart
type ChartData = {
  date: string;
  weight: number | null;
  neck: number | null;
  shoulders: number | null;
  chest: number | null;
  arms: number | null;
  forearms: number | null;
  waist: number | null;
  hips: number | null;
  thighs: number | null;
  calves: number | null;
  [key: string]: string | number | null; // Allow for dynamic keys
};

// Define base props that are common to both chart types
type BaseChartProps = {
  data: ChartData[];
  customLegend?: {
    withCustomLegend: boolean;
    customLegendStyle?: string;
  };
};

// Define props for single measurement chart
type SingleMeasurementChartProps = BaseChartProps & {
  measurement: Measurement;
  showTick?: boolean; // Optional prop for single measurement
  measurements?: never; // Not needed for single measurement
};

// Define props for multiple measurements chart
type MultipleMeasurementsChartProps = BaseChartProps & {
  measurement?: never; // Not needed for multiple measurements
  measurements: Measurement[];
  chartFilter: string[]; // Required for multiple measurements
};

// Union type for the Charts component props
type ChartsProps = SingleMeasurementChartProps | MultipleMeasurementsChartProps;

export type { ChartsProps, ChartData, Measurement, BaseChartProps };
