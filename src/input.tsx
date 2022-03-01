import React from 'react';
import styled from '@emotion/styled';

const Input = styled.input`
  font-size: 24px;
`;

export default ({ id, label, onChange }) => {
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
