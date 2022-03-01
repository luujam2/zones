import React from 'react';
import styled from '@emotion/styled';
import { colourList } from './utils';

const Container = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  overflow-y: auto;

  @media (max-width: 500px) {
    justify-content: initial;
  }
`;
const Item = styled.div<{ isFiltered: boolean }>`
  padding: 5px 0;
  border: 1px solid ${(props) => (props.isFiltered ? 'grey' : 'black')};
  min-width: 100px;
  height: 75px;
  background-color: ${(props) => (props.isFiltered ? 'grey' : 'white')};
  color: ${(props) => (props.isFiltered ? 'white' : 'black')};

  &:hover {
    background-color: ${(props) => (props.isFiltered ? 'white' : 'grey')};
    color: ${(props) => (props.isFiltered ? 'black' : 'white')};
  }
`;

const Colour = styled.div<{ colour: string; isFiltered: boolean }>`
  background-color: ${(props) => (props.isFiltered ? 'grey' : props.colour)};
  margin-top: 10px;
  width: auto;
  height: 10px;
`;

const Text = styled.div`
  text-align: center;
`;

const Line = ({ line, onClick, isFiltered }) => {
  return (
    <Item onClick={onClick} isFiltered={isFiltered}>
      <Text>{line}</Text>
      <Colour colour={colourList[line]} isFiltered={isFiltered} />
    </Item>
  );
};

export default ({ lines, setFilter, filter }) => {
  return (
    <Container>
      {lines.map((line) => (
        <Line
          key={line}
          line={line}
          isFiltered={filter.includes(line)}
          onClick={() => {
            if (filter.includes(line)) {
              setFilter(
                filter.filter(function (item) {
                  return item !== line;
                })
              );
            } else {
              setFilter([...filter, line]);
            }
          }}
        />
      ))}
    </Container>
  );
};
