import React, { useState } from 'react';
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

const Top = styled.div`
  align-self: end;
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
`;

const InfoWrapper = styled.div`
  position: fixed;
  bottom: 10px;
  left: 30px;
  display: flex;
  align-items: center;
`;

const InfoIcon = styled.div`
  font-style: italic;
  border: 1.5px solid black;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  font-size: 9px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Link = styled.a`
  margin-left: 10px;
`;

const Middle = styled.div`
  font-size: 18px;
  margin: 10px 0px 3px 0px;
`;

function Info() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <InfoWrapper>
      <InfoIcon onClick={() => { setIsOpen(!isOpen) }}>i</InfoIcon>
      {isOpen && (
        <Link
          target="_blank"
          rel="noreferrer noopener"
          href="https://twitter.com/guruhhapsara"
        >
          made by @guruhhapsara
        </Link>
      )}
    </InfoWrapper>
  )
}

function Title() {
  const bahasa = shuffle(totalBahasaPerProvince.map(t => `${t.province} ${t.total} bahasa`));

  return (
    <Container>
      <div>
        <Top>
          <div style={{ fontSize: 50 }}>Bahasa</div>
          <div style={{ fontSize: 150 }}>Gallery</div>
        </Top>
        <Middle>Explore 633 languages / bahasa in Indonesia</Middle>
        <Bottom>
          {bahasa.map(d =>
            <Bahasa key={d}>{d}</Bahasa>
          )}
        </Bottom>
      </div>
      <Info />
    </Container>
  )
}

export default Title;
