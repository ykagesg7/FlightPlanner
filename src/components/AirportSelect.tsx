import React from 'react';
import ReactSelect from 'react-select';

interface AirportSelectProps {
  label: string;
  options: any[];
  selectedOption: any;
  onChange: (option: any) => void;
  placeholder: string;
}

const AirportSelect: React.FC<AirportSelectProps> = ({ label, options, selectedOption, onChange, placeholder }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <ReactSelect
        options={options}
        value={selectedOption}
        onChange={onChange}
        placeholder={placeholder}
        isClearable
        styles={{
          control: (provided) => ({
            ...provided,
            borderRadius: '0.5rem',
            borderColor: '#e5e7eb',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '&:hover': {
              borderColor: '#d1d5db',
            },
          }),
        }}
      />
    </div>
  );
};

export default AirportSelect; 