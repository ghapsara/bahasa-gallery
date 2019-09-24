import React from 'react';
import styled from 'styled-components';

const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;

const COLOR = '#423c4a';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  overflow: scroll;
  background: ${COLOR};
`;

function Background() {
  return (
    <Container>
    </Container>
  )
}

export default Background;