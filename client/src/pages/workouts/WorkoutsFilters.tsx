import { CustomSelect, Input } from '_components/shared';
import {
  equipmentOptions,
  muscleGroupOptions,
  muscleSubgroupOptions,
} from '_constants/filtersOptions';

type WorkoutsFiltersProps = {
  filters: {
    exercise: string;
    equipment: string;
    muscleGroup: string;
    muscleSubgroup: string;
  };
  onChangeFilter: (
    key: keyof WorkoutsFiltersProps['filters'],
    value: string
  ) => void;
};

export const WorkoutsFilters = ({
  filters,
  onChangeFilter,
}: WorkoutsFiltersProps) => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-5'>
      <Input
        label='Exercise'
        value={filters?.exercise}
        onChange={(val) => onChangeFilter('exercise', val)}
        placeholder='Search Exercise'
      />
      <CustomSelect
        value={filters?.muscleGroup}
        label='Muscle Group'
        onChange={(val) => onChangeFilter('muscleGroup', val as string)}
        options={muscleGroupOptions}
      />
      <CustomSelect
        value={filters?.muscleSubgroup}
        label='Muscle Subgroup'
        isDisabled={filters?.muscleGroup === 'all'}
        onChange={(val) => onChangeFilter('muscleSubgroup', val as string)}
        options={
          filters?.muscleGroup
            ? muscleSubgroupOptions?.[
                filters?.muscleGroup as keyof typeof muscleSubgroupOptions
              ]
            : []
        }
      />
      <CustomSelect
        value={filters?.equipment}
        label='Equipment'
        onChange={(val) => onChangeFilter('equipment', val as string)}
        options={equipmentOptions}
      />
    </div>
  );
};
