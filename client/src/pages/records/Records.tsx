import AddNewRecords from './AddNewRecords/AddNewRecords';
import {
  Button,
  Table,
  RecordChart,
  Tabs,
  CardSkeleton,
} from '_components/shared';
import {
  useDeleteRecord,
  useGetAllRecords,
} from '_queries/recordQueries/recordQueries';
import { IRecord } from '_services/recordServices';
import EditRecord from './components/EditRecord';
import useFilters from 'react-filter-hook';

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};

export const Records = () => {
  const { data: records, isFetching } = useGetAllRecords();
  const { mutateAsync: deleteRecord } = useDeleteRecord();

  const {
    filters: { viewMode },
    onChangeFilter,
  } = useFilters({
    initialFilters: {
      viewMode: 'table' as 'table' | 'chart',
    },
  });

  const handleDeleteRecord = async (recordId: string) => {
    await deleteRecord(recordId);
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between max-sm:flex-wrap gap-4'>
        <Tabs
          options={[
            { value: 'table', label: 'Table View' },
            { value: 'chart', label: 'Chart View' },
          ]}
          value={viewMode}
          onChange={(value) =>
            onChangeFilter('viewMode', value as 'table' | 'chart')
          }
          variant='pills'
          size='md'
        />
        <AddNewRecords />
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className='w-full flex flex-col gap-5'>
          <Table
            loading={isFetching}
            dataSource={records?.items || []}
            headerOrientation='vertical'
            columns={[
              {
                dataIndex: 'date',
                title: 'Date',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? formatDate(value as number) : '-'),
              },
              {
                dataIndex: 'measurements.weight',
                title: 'Weight',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? (value as number) : '-'),
              },
              {
                dataIndex: 'measurements.neck',
                title: 'Neck',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? (value as number) : '-'),
              },
              {
                dataIndex: 'measurements.shoulders',
                title: 'Shoulders',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? (value as number) : '-'),
              },
              {
                dataIndex: 'measurements.chest',
                title: 'Chest',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? (value as number) : '-'),
              },
              {
                dataIndex: 'measurements.arms',
                title: 'Arms',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? (value as number) : '-'),
              },
              {
                dataIndex: 'measurements.forearms',
                title: 'Forearms',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? (value as number) : '-'),
              },
              {
                dataIndex: 'measurements.waist',
                title: 'Waist',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? (value as number) : '-'),
              },
              {
                dataIndex: 'measurements.hips',
                title: 'Hips',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? (value as number) : '-'),
              },
              {
                dataIndex: 'measurements.thighs',
                title: 'Thighs',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? (value as number) : '-'),
              },
              {
                dataIndex: 'measurements.calves',
                title: 'Calves',
                align: 'center',
                showTitle: true,
                render: (value) => (value ? (value as number) : '-'),
              },
              {
                dataIndex: '_id',
                title: '',
                align: 'center',
                showTitle: true,
                render: (value, record) => {
                  const id = value as string;
                  return (
                    <div className='flex items-center justify-center gap-2'>
                      <EditRecord record={record as IRecord} />
                      <Button
                        onClick={() => handleDeleteRecord(id)}
                        iconButton='delete'
                        variant='dangerOutline'
                        className='border-none'
                      />
                    </div>
                  );
                },
              },
            ]}
          />
        </div>
      )}

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className='relative'>
          <CardSkeleton loading={isFetching} count={1} rows={16} />
          {!isFetching && !!records?.items?.length && (
            <RecordChart records={records?.items || []} variant='records' />
          )}
          {!isFetching && !records?.items?.length && (
            <div className='bg-black-5 rounded-secondary p-8 text-center'>
              <p className='text-white-4'>
                No records available to display charts.
              </p>
              <p className='text-white-6 text-sm mt-2'>
                Add some records to see your progress charts.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
