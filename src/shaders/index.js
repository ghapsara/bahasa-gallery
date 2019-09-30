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
    backgroundMask: { value: null },
    textMask: { value: null },
    top: { value: 0.0 }
  },
  fragmentShader: `
    varying vec4 textureCoord;

    uniform sampler2D map;
    uniform sampler2D backgroundMask;
    uniform sampler2D textMask;
    uniform float top;

    void main() {
      float x = (textureCoord.x / textureCoord.w);
      float y = (textureCoord.y / textureCoord.w);

      vec2 mapPosition = vec2(x, y);
      vec2 maskTextPosition = vec2(x, y - top);

      vec3 mapTexture = texture2D(map, mapPosition).xyz;
      vec3 backgroundMaskTexture = texture2D(backgroundMask, mapPosition).xyz;
      vec3 textMaskTexture = texture2D(textMask, maskTextPosition).xyz;

      gl_FragColor = vec4(mix(backgroundMaskTexture, mapTexture, textMaskTexture), 1.0);
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
