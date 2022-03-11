import React, { useState } from 'react';
import { Station } from './app';
import Input from './input';
import styled from '@emotion/styled';

const Form = styled.form``;

const FormItem = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 0;
`;

const Submit = styled.input`
  font-size: 36px;
  min-width: 150px;
`;

export default ({
  setStart,
  start,
  setEnd,
  end,
  setShouldFetch,
}: {
  setStart: React.Dispatch<React.SetStateAction<string>>;
  start: string;
  setEnd: React.Dispatch<React.SetStateAction<string>>;
  end: string;
  setShouldFetch: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <>
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          setShouldFetch(true);
        }}
      >
        <FormItem>
          <Input
            id="start-station"
            label="Start station"
            onChange={(value) => {
              setStart(value);
            }}
            value={start}
          />
        </FormItem>

        <FormItem>
          <Input
            id="end-station"
            label="Destination"
            onChange={(value) => {
              setEnd(value);
            }}
            value={end}
          />
        </FormItem>

        <FormItem>
          <Submit type="submit" value="Go" />
        </FormItem>
      </Form>
    </>
  );
};
