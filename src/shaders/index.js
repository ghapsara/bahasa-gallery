import * as THREE from 'three';

export const ColorShader = {
  uniforms: {
    tDiffuse: { value: null },
    color: { value: new THREE.Color(0x88CCFF) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec3 color;
    void main() {
      vec4 previousPassColor = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(
          previousPassColor.rgb * color,
          previousPassColor.w);
    }
  `,
};

export const MaskShader = {
  uniforms: {
    map: { value: null },
    mask: { value: null },
  },
  fragmentShader: `
    varying vec4 textureCoord;

    uniform sampler2D map;
    uniform sampler2D mask;

    void main() {
      float x = (textureCoord.x / textureCoord.w);
      float y = (textureCoord.y / textureCoord.w);
      vec2 mapPosition = vec2(x, y);

      vec3 mapTexture = texture2D(map, mapPosition).xyz;
      vec3 maskTexture = texture2D(mask, mapPosition).xyz;

      gl_FragColor = vec4(mapTexture, maskTexture.r);
    }
  `,
  vertexShader: `
    varying vec4 textureCoord;

    void main() {
      textureCoord = vec4(uv, 0.0, 1.0);

      vec3 p = position;    
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `
}

export default {
  ColorShader,
  MaskShader,
};
