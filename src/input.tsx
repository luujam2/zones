import React from 'react';
import styled from '@emotion/styled';

const Input = styled.input`
  font-size: 24px;
`;

type InputProps = {
  id: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default ({ id, label, onChange }: InputProps) => {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div>
        <Input
          list="stations"
          id={id}
          name={id}
          onChange={(e) => {
            onChange(e);
          }}
        />
      </div>
    </div>
  );
};
