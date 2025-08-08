import { forwardRef } from 'react';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import clsx from 'clsx';
import { colors } from '_constants/colors';

export interface DatePickerProps {
  label?: string;
  error?: string;
  containerClass?: string;
  className?: string;
  value: number | null;
  onChange: (date: number | null) => void;
  disabled?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  name?: string;
}

export const DatePicker = forwardRef<HTMLDivElement, Partial<DatePickerProps>>(
  (
    {
      label,
      error,
      containerClass,
      className,
      value,
      onChange,
      disabled,
      minDate,
      maxDate,
      name,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={clsx('w-full', containerClass)}>
        {label && (
          <label className='block text-sm font-medium mb-1 text-white-1'>
            {label}
          </label>
        )}

        <MobileDatePicker
          value={value ? dayjs(value) : null}
          onChange={(date) => onChange?.(date ? date.valueOf() : null)}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          slotProps={{
            textField: {
              name: name,
              error: !!error,
              helperText: error ? error : '',
              fullWidth: true,
              size: 'small',
              className: className,
              sx: {
                '& .MuiOutlinedInput-root': {
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: colors.black[5],
                  color: colors.white[1],
                  '& fieldset': {
                    borderWidth: '2px',
                    borderColor: error ? colors.red[1] : colors.white[2],
                  },
                  '&:hover fieldset': {
                    borderColor: error ? colors.red[1] : colors.white[1],
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: error ? colors.red[1] : colors.blue[1],
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                },
                '& .MuiFormHelperText-root': {
                  color: colors.red[1],
                  marginLeft: '0',
                  marginTop: '0.25rem',
                  fontSize: '0.875rem',
                },
              },
            },
          }}
        />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
