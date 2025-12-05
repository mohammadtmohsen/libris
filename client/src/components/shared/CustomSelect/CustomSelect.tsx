import { colors } from '_constants/colors';
import clsx from 'clsx';
import React, { ForwardedRef, ReactNode, useEffect, useState } from 'react';
import Select, {
  GroupBase,
  PropsValue,
  SelectInstance,
  Props as SelectProps,
  StylesConfig,
  SingleValue,
  MultiValue,
  ActionMeta,
  components,
  OptionProps,
  SingleValueProps,
} from 'react-select';

type OptionType = {
  label: string;
  customLabel?: ReactNode | string;
  value: string;
};

const CustomOption = <T extends OptionType>({
  children: _,
  ...props
}: OptionProps<T>) => (
  <components.Option {...props}>
    {props.data.customLabel ?? props.data.label} {/* Show JSX in dropdown */}
  </components.Option>
);

// Custom SingleValue component for selected value display
const CustomSingleValue = <T extends OptionType>({
  data,
  ...props
}: SingleValueProps<T>) => (
  <components.SingleValue {...props} data={data}>
    {data.label} {/* Show simple string when selected */}
  </components.SingleValue>
);

export interface CustomSelectProps<T extends OptionType>
  extends Omit<SelectProps<T>, 'styles' | 'isMulti' | 'onChange' | 'value'> {
  label?: string;
  value?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
  dir?: 'rtl' | 'ltr';
  error?: string;
  containerClass?: string;
  isMulti?: boolean;
  defaultOptions?: boolean | T[];
  customStyles?: StylesConfig<T>;
}

export const CustomSelect = React.forwardRef(function CustomSelect<
  T extends OptionType
>(
  {
    label,
    value,
    onChange,
    error,
    dir = 'ltr',
    containerClass,
    isMulti = false,
    options = [],
    defaultValue,
    customStyles,
    ...rest
  }: CustomSelectProps<T>,
  ref: ForwardedRef<SelectInstance<T, boolean, GroupBase<T>>>
) {
  const [internalValue, setInternalValue] = useState<PropsValue<T>>(null);
  const isRtl = dir === 'rtl';

  // Convert string value to OptionType
  useEffect(() => {
    if (isMulti && Array.isArray(value)) {
      const selectedOptions = options.filter(
        (opt): opt is T => 'value' in opt && value.includes(opt.value)
      );
      setInternalValue(selectedOptions as T[]);
    } else if (!isMulti && typeof value === 'string') {
      const selectedOption =
        options.find(
          (opt): opt is T => 'value' in opt && opt.value === value
        ) || null;
      setInternalValue(selectedOption);
    } else {
      setInternalValue(value as PropsValue<T>);
    }
  }, [value, options, isMulti]);

  const handleChange = (
    newValue: SingleValue<T> | MultiValue<T>,
    _actionMeta: ActionMeta<T>
  ) => {
    if (isMulti) {
      const values = (newValue as T[])?.map((opt) => opt.value) || [];
      onChange?.(values);
    } else {
      const singleValue = (newValue as T)?.value || null;
      onChange?.(singleValue);
    }
  };

  return (
    <div className={clsx('w-full', containerClass)}>
      {label && (
        <label className='mb-1 block text-left text-sm font-medium text-white/90'>
          {label}
        </label>
      )}

      <Select
        ref={ref}
        value={internalValue}
        styles={{
          control: (base, { isFocused }) => ({
            ...base,
            direction: dir,
            minHeight: '44px',
            backgroundColor: 'rgba(34,34,34,0.85)',
            borderColor: error
              ? colors.red[1]
              : isFocused
              ? colors.blue[1]
              : colors.blue[1] + '33',
            borderWidth: '1px',
            borderRadius: 12,
            boxShadow: isFocused
              ? `0 0 0 2px ${colors.blue[1]}55`
              : '0 8px 30px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(6px)',
            '&:hover': {
              borderColor: error ? colors.red[1] : colors.blue[1],
            },
          }),
          menu: (base) => ({
            ...base,
            direction: dir,
            backgroundColor: 'rgba(20,22,28,0.95)',
            border: `1px solid ${colors.blue[1]}33`,
            borderRadius: 14,
            overflow: 'hidden',
            backdropFilter: 'blur(6px)',
            zIndex: 9999, // Ensure menu is above other elements
            position: 'absolute',
            width: '100%',
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          menuList: (base) => ({
            ...base,
            maxHeight: '300px', // Set a reasonable max height
            paddingTop: '6px',
            paddingBottom: '6px',
          }),
          option: (base, { isFocused, isSelected }) => ({
            ...base,
            backgroundColor: isSelected
              ? colors.blue[1] + '33'
              : isFocused
              ? colors.blue[1] + '22'
              : 'transparent',
            color: colors.white[1],
            borderRadius: 10,
            textAlign: isRtl ? 'right' : 'left',
            '&:active': {
              backgroundColor: colors.blue[1] + '44',
            },
          }),
          placeholder: (base) => ({
            ...base,
            color: colors.white[4],
            textAlign: isRtl ? 'right' : 'left',
          }),
          singleValue: (base) => ({
            ...base,
            color: colors.white[1],
            textAlign: isRtl ? 'right' : 'left',
          }),
          indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: colors.white[4] + '80',
          }),
          dropdownIndicator: (base, { isFocused }) => ({
            ...base,
            color: isFocused ? colors.blue[1] : colors.white[2],
            '&:hover': {
              color: colors.blue[1],
            },
          }),
          input: (base) => ({
            ...base,
            color: colors.white[1],
            textAlign: isRtl ? 'right' : 'left',
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: colors.blue[1] + '26',
            borderRadius: 8,
            border: `1px solid ${colors.blue[1]}55`,
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: colors.white[1],
            paddingRight: 6,
            paddingLeft: 8,
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: colors.white[3],
            '&:hover': {
              backgroundColor: colors.red[1],
              color: colors.white[1],
            },
          }),

          ...customStyles,
        }}
        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
        classNamePrefix='react-select'
        isMulti={isMulti}
        options={options}
        defaultValue={defaultValue}
        onChange={handleChange}
        isRtl={isRtl}
        menuPortalTarget={document.body} // Render menu in a portal to avoid container issues
        menuPosition='fixed' // Use fixed position for better positioning
        {...rest}
      />

      {error && <p className='mt-1 text-sm text-red-1'>{error}</p>}
    </div>
  );
});
