import clsx from 'clsx';
import React from 'react';

export type AlignTypes = 'right' | 'left' | 'center';

export type Column<T> = {
  dataIndex: string;
  render?: (
    value: string | number | Record<string, string | number>,
    record: T
  ) => React.ReactNode;
  align?: AlignTypes;
  title: React.ReactNode;
  showTitle?: boolean;
  className?: string;
  colClassName?: string;
  colContainerClassName?: string;
  tHeadClassName?: string;
  width?: string;
};

type TableProps<T> = {
  loading?: boolean;
  columns: Array<Column<T>>;
  onClickRow?: (item: T) => void;
  dataSource: T[];
  emptyState?: React.ReactNode;
  headerOrientation?: 'vertical' | 'horizontal';
};

const ALIGN_TEXT = {
  right: 'text-right',
  left: 'text-left',
  center: 'text-center',
};

const returnFinalData = <T,>(data: T, key: string) => {
  return key?.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && !Array.isArray(acc)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, data);
};

const TableSkeleton = <T,>({
  columns,
  rowCount = 5,
}: {
  columns: Array<Column<T>>;
  rowCount?: number;
}) => {
  return (
    <>
      {[...Array(rowCount)].map((_, rowIndex) => (
        <tr key={rowIndex} className='animate-pulse min-h-[56px]'>
          {columns.map((_, colIndex) => (
            <td key={colIndex} className='px-3 py-2 min-h-[56px]'>
              <div className='h-10 bg-black-3 rounded'></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const Table = <T extends object>({
  columns,
  dataSource,
  onClickRow,
  headerOrientation = 'horizontal',
  loading = false,
  emptyState,
}: TableProps<T>) => {
  return (
    <div className='rounded-secondary bg-black-5 p-3 sm:p-5'>
      <div className='w-full overflow-x-auto'>
        <table className={clsx('min-w-max w-full table-auto')}>
          {headerOrientation === 'horizontal' ? (
            <>
              <thead>
                <tr>
                  {columns.map((column, colIndex) => (
                    <th
                      key={colIndex}
                      className={clsx(
                        'sticky top-0 bg-gray-900 z-20 px-4 py-2',
                        'whitespace-nowrap text-left align-middle',
                        'bg-blue-4',
                        column.width || '',
                        ALIGN_TEXT[column.align || 'left'],
                        column.tHeadClassName
                      )}
                      style={column.width ? { width: column.width } : {}}
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <TableSkeleton columns={columns} rowCount={columns.length} />
                )}
                {!loading && !dataSource?.length && (
                  <tr>
                    <td colSpan={columns.length}>
                      <div className='flex items-center justify-center min-h-[150px]'>
                        {emptyState ? (
                          emptyState
                        ) : (
                          <p className='text-white-4 text-sm italic'>
                            No data available
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                {!loading &&
                  dataSource?.map((item, itemIndex) => (
                    <tr
                      key={itemIndex}
                      className={clsx('group', onClickRow && 'cursor-pointer')}
                      onClick={() => onClickRow?.(item)}
                    >
                      {columns.map(
                        (
                          {
                            dataIndex,
                            align,
                            colContainerClassName,
                            render,
                            width,
                          },
                          colIndex
                        ) => {
                          const finalValue = returnFinalData(item, dataIndex);
                          return (
                            <td
                              key={colIndex}
                              className={clsx(
                                'whitespace-nowrap px-3 py-2 align-middle',
                                ALIGN_TEXT[align || 'left'],
                                itemIndex % 2 === 0
                                  ? 'bg-black-3'
                                  : 'bg-black-4',
                                colContainerClassName
                              )}
                              style={width ? { width } : {}}
                            >
                              {render
                                ? render(
                                    finalValue as
                                      | string
                                      | number
                                      | Record<string, string | number>,
                                    item
                                  )
                                : (finalValue as React.ReactNode)}
                            </td>
                          );
                        }
                      )}
                    </tr>
                  ))}
              </tbody>
            </>
          ) : (
            <tbody>
              {loading && (
                <TableSkeleton columns={columns} rowCount={columns.length} />
              )}
              {!loading && !dataSource?.length && (
                <tr>
                  <td colSpan={columns.length}>
                    <div className='flex items-center justify-center min-h-[150px]'>
                      {emptyState ? (
                        emptyState
                      ) : (
                        <p className='text-white-4 text-sm italic'>
                          No data available
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                dataSource?.length > 0 &&
                columns.map(
                  (
                    {
                      title,
                      dataIndex,
                      align,
                      colContainerClassName,
                      render,
                      tHeadClassName,
                      width,
                    },
                    colIndex
                  ) => (
                    <tr
                      key={colIndex}
                      className={clsx(
                        'group',
                        onClickRow && 'cursor-pointer',
                        colIndex % 2 === 0 ? 'bg-black-3' : 'bg-black-4'
                      )}
                    >
                      <th
                        className={clsx(
                          'sticky left-0 bg-gray-900 z-10 px-4 py-4',
                          'whitespace-nowrap text-left align-middle',
                          colIndex % 2 === 0 ? 'bg-blue-5' : 'bg-blue-4',
                          ALIGN_TEXT[align || 'left'],
                          tHeadClassName
                        )}
                        style={width ? { width } : {}}
                      >
                        {title}
                      </th>
                      {dataSource.map((item, itemIndex) => {
                        const finalValue = returnFinalData(item, dataIndex);
                        return (
                          <td
                            key={itemIndex}
                            className={clsx(
                              'whitespace-nowrap px-3 py-2 align-middle',
                              ALIGN_TEXT[align || 'left'],
                              colContainerClassName
                            )}
                          >
                            {render
                              ? render(
                                  finalValue as
                                    | string
                                    | number
                                    | Record<string, string | number>,
                                  item
                                )
                              : (finalValue as React.ReactNode)}
                          </td>
                        );
                      })}
                    </tr>
                  )
                )}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};
