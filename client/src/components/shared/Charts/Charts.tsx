import clsx from 'clsx';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartsProps } from './Charts.type';

// Define the props for the CustomTooltip component
const CustomTooltip = (props: TooltipProps<number, string>) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    return (
      <div className='bg-black-3 p-3 rounded-primary border-2 border-blue-1'>
        <p className='font-semibold mb-2'>{`Date: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Charts = (props: ChartsProps) => {
  const { data, customLegend } = props;

  // Determine if we're in single or multiple measurement mode based on props
  const isSingleMeasurement =
    'measurement' in props && props.measurement !== undefined;

  // Get the measurement or measurements based on the mode
  const singleMeasurement = isSingleMeasurement ? props.measurement : undefined;
  const multipleMeasurements = !isSingleMeasurement
    ? props.measurements
    : undefined;
  const filter = !isSingleMeasurement ? props.chartFilter : undefined;

  return (
    <div className='relative flex w-full'>
      {customLegend?.withCustomLegend && singleMeasurement && (
        <h2
          className={clsx(
            'absolute text-sm text-white-5 text-center top-[7px] left-[70px]'
          )}
          style={{
            color: singleMeasurement.color,
          }}
        >
          {singleMeasurement.title}
        </h2>
      )}
      <ResponsiveContainer
        width='100%'
        height={isSingleMeasurement ? 100 : 500}
      >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='date'
            tick={isSingleMeasurement ? props.showTick : true}
          />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip content={CustomTooltip} />

          {isSingleMeasurement && singleMeasurement ? (
            // Single line mode
            <Line
              type='monotone'
              dataKey={singleMeasurement.key}
              stroke={singleMeasurement.color}
            />
          ) : (
            // Multiple lines mode
            multipleMeasurements &&
            filter &&
            multipleMeasurements
              .filter((m) => filter.includes(m.key))
              .map((m) => (
                <Line
                  key={m.key}
                  type='monotone'
                  dataKey={m.key}
                  stroke={m.color}
                />
              ))
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
