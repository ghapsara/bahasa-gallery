import React from 'react';
import styled from 'styled-components';

const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: scroll;
`;

const ScrollWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: ${props => props.height}px;
`;

const SvgContainer = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
`;


function Scroll() {
  return (
    <Container>
      <ScrollWrapper height={window.innerHeight * 2}>
        <SvgContainer>
          <svg
            width={WIDTH}
            height={HEIGHT}
          >
            <rect
              x={0}
              y={0}
              width={WIDTH}
              height={200}
            />
          </svg>
        </SvgContainer>
      </ScrollWrapper>
    </Container>
  )
}

export default Scroll;