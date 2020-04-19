import React from 'react';
import styled from 'styled-components';
import { shuffle } from 'canvas-sketch-util/random';
import { totalBahasaPerProvince } from './data';

const Container = styled.div`
  height: 100vh;
  width: 25vw;
  display: flex;
  align-items: center;
  padding-left: 30px;
  cursor: default;
`;

const Center = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-row-gap: 15px;
`;

const Top = styled.div`
  align-self: end;
  font-size: 100px;
`;

const Bottom = styled.div`
  align-self: start;
  display: flex;
  flex-wrap: wrap;  
`;

const Bahasa = styled.div`
  display: flex;
  margin: 0px;
  margin-right: 5px;
  margin-bottom: 2px;
`

function Title() {
  const bahasa = shuffle(totalBahasaPerProvince.map(t => `${t.province} ${t.total} bahasa`));

  return (
    <Container>
      <Center>
        <Top>
          <div style={{ fontSize: 50 }}>Bahasa</div>
          <div style={{ fontSize: 150 }}>Gallery</div>
        </Top>
        <Bottom>
          {bahasa.map(d =>
            <Bahasa key={d}>{d}</Bahasa>
          )}
        </Bottom>
      </Center>
    </Container>
  )
}

export default Title;
