import React from 'react';
import ReactSelect from 'react-select';

interface AirportSelectProps {
  label: string;
  options: any[];
  selectedOption: any;
  onChange: (option: any) => void;
  placeholder?: string;
  className?: string;
  styles?: any;
}

const AirportSelect: React.FC<AirportSelectProps> = ({ label, options, selectedOption, onChange, placeholder }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white-700 mb-2">{label}</label>
      <ReactSelect
        options={options}
        value={selectedOption}
        onChange={onChange}
        placeholder={placeholder}
        isClearable
        styles={{
          control: (provided: any) => ({
            ...provided,
            borderRadius: '0.5rem',
            borderColor: '#e5e7eb',
            backgroundColor: '#4b5563',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '&:hover': {
              borderColor: '#d1d5db',
            },
          }),
          menu: (provided: any) => ({
            ...provided,
            backgroundColor: '#4b5563',
          }),
          option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#6b7280' : '#4b5563',
            color: 'white',
          }),
          placeholder: (provided: any) => ({
            ...provided,
            color: 'white',
          }),
          input: (provided: any) => ({
            ...provided,
            color: 'white',
          }),
          singleValue: (provided: any) => ({
            ...provided,
            color: 'white',
          }),
        }}
      />
    </div>
  );
};

export default AirportSelect; 