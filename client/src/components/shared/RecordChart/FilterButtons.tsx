import { Button } from '_components/shared';

export const FilterButtons = ({
  measurements,
  chartFilter,
  onChangeFilter,
  toggleMeasurement,
}: {
  measurements: {
    key: string;
    title: string;
    shortTitle: string;
    color: string;
  }[];
  chartFilter: string[];
  onChangeFilter: (
    key: 'chartFilter',
    value?: string[],
    option?: { resetSkip?: boolean }
  ) => void;
  toggleMeasurement: (measurement: string) => void;
}) => {
  return (
    <div className='flex flex-col justify-between gap-4'>
      <div className='grid grid-cols-1 gap-2 content-start justify-items-center'>
        {measurements.map((measurement) => (
          <Button
            key={measurement.key}
            onClick={() => toggleMeasurement(measurement.key)}
            variant={
              !chartFilter.includes(measurement.key) ? 'primary' : 'outline'
            }
            className='px-3 py-1 text-sm min-w-[80px]'
            style={{
              color: !chartFilter.includes(measurement.key)
                ? 'white'
                : measurement.color,
            }}
          >
            {measurement.shortTitle}
          </Button>
        ))}
      </div>
      <div className='flex xflex-col gap-2 mt-4'>
        <Button
          onClick={() => {
            onChangeFilter(
              'chartFilter',
              measurements.map((measurement) => measurement.key)
            );
          }}
          iconButton='published'
          variant='secondary'
          className='mt-auto'
          disabled={chartFilter.length === measurements.length}
        />

        <Button
          onClick={() => {
            onChangeFilter('chartFilter', []);
          }}
          variant='secondaryOutline'
          iconButton='clearAll'
          disabled={chartFilter.length === 0}
        />
      </div>
    </div>
  );
};
