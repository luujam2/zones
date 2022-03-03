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
  stations,
  setStart,
  start,
  setEnd,
  end,
  setShouldFetch,
}: {
  stations: Station[];
  setStart: React.Dispatch<React.SetStateAction<string | undefined>>;
  start: string | undefined;
  setEnd: React.Dispatch<React.SetStateAction<string | undefined>>;
  end: string | undefined;
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setStart(e.target.value);
            }}
            value={start}
          />
        </FormItem>

        <FormItem>
          <Input
            id="end-station"
            label="Destination"
            onChange={(e) => {
              setEnd(e.target.value);
            }}
            value={end}
          />
        </FormItem>
        <datalist id="stations">
          {stations.map((station) => (
            <option key={station.commonName} value={station.commonName} />
          ))}
        </datalist>
        <FormItem>
          <Submit type="submit" value="Go" />
        </FormItem>
      </Form>
    </>
  );
};
