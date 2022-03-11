import React, { useState } from 'react';
import styled from '@emotion/styled';
import Autosuggest from 'react-autosuggest';
import stations from '../data/stations';

const stationNames = stations.map((station) => station.commonName);

const Input = styled.div`
  .react-autosuggest__container {
    position: relative;
  }

  .react-autosuggest__input {
    width: 240px;
    height: 30px;
    padding: 10px 20px;
    font-weight: 300;
    font-size: 24px;
    border: 1px solid #aaa;
    border-radius: 4px;
  }

  .react-autosuggest__input--focused {
    outline: none;
  }

  .react-autosuggest__input--open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .react-autosuggest__suggestions-container {
    display: none;
  }

  .react-autosuggest__suggestions-container--open {
    display: block;
    position: absolute;
    top: 51px;
    width: 280px;
    border: 1px solid #aaa;
    background-color: #fff;
    font-weight: 300;
    font-size: 16px;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 2;
  }

  .react-autosuggest__suggestions-list {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .react-autosuggest__suggestion {
    cursor: pointer;
    padding: 10px 20px;
  }

  .react-autosuggest__suggestion--highlighted {
    background-color: #ddd;
  }
`;

type InputProps = {
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

export default ({ id, label, onChange, value }: InputProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <Input>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={({ value }) => {
            const inputValue = value.trim().toLowerCase();
            const inputLength = inputValue.length;

            const res =
              inputLength === 0
                ? []
                : stationNames.filter(
                    (stn) =>
                      stn.toLowerCase().slice(0, inputLength) === inputValue
                  );
            setSuggestions(res);
          }}
          onSuggestionsClearRequested={() => setSuggestions([])}
          getSuggestionValue={(suggestion) => suggestion}
          renderSuggestion={(suggestion) => {
            return <div>{suggestion}</div>;
          }}
          inputProps={{
            name: id,
            value,
            onChange: (e, { newValue }) => {
              onChange(newValue);
            },
          }}
        />
      </Input>
    </div>
  );
};
