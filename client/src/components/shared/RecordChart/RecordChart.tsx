import { Charts } from '_components/shared';
import { FilterButtons } from './FilterButtons';
import { MEASUREMENTS } from '_constants/measurements';
import { IRecord } from '_services/recordServices';
import useFilters from 'react-filter-hook';

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};

const transformRecordsForChart = (records: IRecord[]) => {
  return records?.map((record) => ({
    date: formatDate(record.date),
    weight: record.measurements?.weight,
    neck: record.measurements?.neck,
    shoulders: record.measurements?.shoulders,
    chest: record.measurements?.chest,
    arms: record.measurements?.arms,
    forearms: record.measurements?.forearms,
    waist: record.measurements?.waist,
    hips: record.measurements?.hips,
    thighs: record.measurements?.thighs,
    calves: record.measurements?.calves,
  }));
};

interface RecordChartProps {
  records: IRecord[];
  variant?: 'dashboard' | 'records';
}

export const RecordChart = ({
  records,
  variant = 'records',
}: RecordChartProps) => {
  const data = transformRecordsForChart(records || []);
  const {
    filters: { chartFilter },
    onChangeFilter,
  } = useFilters({
    initialFilters: {
      chartFilter: [
        'weight',
        'neck',
        'shoulders',
        'chest',
        'arms',
        'forearms',
        'waist',
        'hips',
        'thighs',
        'calves',
      ],
    },
  });

  const toggleMeasurement = (measurement: string) => {
    if (chartFilter.includes(measurement)) {
      onChangeFilter(
        'chartFilter',
        chartFilter.filter((m) => m !== measurement)
      );
    } else {
      onChangeFilter('chartFilter', [...chartFilter, measurement]);
    }
  };

  return (
    <div className='flex flex-col'>
      {/* Dashboard view - shows overview chart with filter buttons */}
      {variant === 'dashboard' && (
        <div className='flex gap-4'>
          <Charts
            data={data}
            measurements={MEASUREMENTS}
            chartFilter={chartFilter}
          />
          <FilterButtons
            measurements={MEASUREMENTS}
            chartFilter={chartFilter}
            onChangeFilter={onChangeFilter}
            toggleMeasurement={toggleMeasurement}
          />
        </div>
      )}

      {/* Records view - shows individual charts for each measurement */}
      {variant === 'records' && (
        <div className='flex gap-5 mt-5'>
          <div className='w-full '>
            {MEASUREMENTS.filter((measurement) =>
              chartFilter.includes(measurement.key)
            ).map((measurement, index) => (
              <Charts
                key={measurement.key}
                data={data}
                showTick={
                  index ===
                  MEASUREMENTS.filter((measurement) =>
                    chartFilter.includes(measurement.key)
                  ).length -
                    1
                }
                measurement={measurement}
                customLegend={{ withCustomLegend: true }}
              />
            ))}
          </div>
          <FilterButtons
            measurements={MEASUREMENTS}
            chartFilter={chartFilter}
            onChangeFilter={onChangeFilter}
            toggleMeasurement={toggleMeasurement}
          />
        </div>
      )}
    </div>
  );
};
