// import * as THREE from 'three';

// <div class="link">
// <a href="https://twitter.com/cjgammon">@cjgammon</a>
// </div>

// <script id="fragShader" type="x-shader/x-fragment">
//   varying vec4 textureCoord;

//   uniform sampler2D map;
//   uniform sampler2D mask;

//   void main() {

//     float x = (textureCoord.x / textureCoord.w);
//     float y = (textureCoord.y / textureCoord.w);
//     vec2 mapPosition = vec2(x, y);

//     vec3 mapTexture = texture2D(map, mapPosition).xyz;
//     vec3 maskTexture = texture2D(mask, mapPosition).xyz;

//     gl_FragColor = vec4(mapTexture, maskTexture.r);
// }
// </script>

// <script id="vertShader" type="x-shader/x-fragment">
//   varying vec4 textureCoord;

//   void main() {
//     textureCoord = vec4(uv, 0.0, 1.0);

//     vec3 p = position;    
//     vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
//     gl_Position = projectionMatrix * mvPosition;
//   }
// </script>


// class Dust {
//   constructor() {
//     var mesh,
//       geometry,
//       material,
//       p,
//       particle,
//       vert,
//       speed,
//       _x,
//       _y,
//       _z;

//     this.delta = 0;

//     geometry = new THREE.Geometry();
//     material = new THREE.ParticleBasicMaterial({
//       color: 0xFFFFFF,
//       size: 20,
//       map: THREE.ImageUtils.loadTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkJBMjU2QTc5RDQ4NTExRTNCN0UxQUFCM0E1RjNCMTgzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkJBMjU2QTdBRDQ4NTExRTNCN0UxQUFCM0E1RjNCMTgzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QkEyNTZBNzdENDg1MTFFM0I3RTFBQUIzQTVGM0IxODMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QkEyNTZBNzhENDg1MTFFM0I3RTFBQUIzQTVGM0IxODMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7+rtUtAAAEdklEQVR42rSajW6rMAyFcQisff93vV0LJFdUpDKHYyewDSkKrCz4w/nzMdI1HDnncirqz6Jqdo73ZWxW1ez8c4+IVG2UCxBiGC/Gb57x2fnbKSA5CVDqAEaHClDnGLuW5PyWW2DkghcCnOsiUNPmleFJlUzOm2HkBEQgxvdQI5Rug3lhgTrBtb53N4YQRhogLABdogFkdS1tsC4zAbS63g5GGiCKQcXIqIyPcN0DjMCslclbn7eyXk8AtZDuR2EQxINA4weoI3ipBaQYPEE9A9RiwexACIRANypGDk6JxCs4cxVDNEQx2iozgUl6AlhhoupSFkSvIEZVj+paw5zxSIHQLyE4y0Imbb4dIeANPbB76Eba+C9Vl9/iRZC1vDagtX5u5aXKBF3t0M00CJuZBoD42soNgMp9OEZwZrRANISG+W6EeXtEewPHxUAAbupag0SYhqUy/eJgLwZ/KwiEeSn4nVcKCBsXGqIYfwcgPU76ykCvjRPtlW9SnsozODV/QLQ3ypvV3em+GX4Hr4xqfHhrCNtraa9MZIw8NoCHgnkBzA6ELXgDdKe7KggykJVdnL1czSsahME8mVcKCPMGg0AQHORyAsQaKwjyAKgnjJU3TCTb7kCm32gsftZ0K5VYR4xAS8MNMKu5z4rGYsg2hbEBIBhRpHUEAnJ2H/d+RjRWdGuXy2Ymtttt8YY07CasPdzhecEJWVnDoRJ3NIXP5H4rTLCeL5ZHOgMiGFv5lrD2CoxUok/zeaGxUWlp7AKMF1J7YfVBRwiVt1RTTX5ivAd15oVJ5wgEv23cnx+e0mEJakyj+ovD0rjoM0OD7pSM6982uqtoW5ZwlzVITfVLRk11pwvGsz1YJpJQMl5mDhXxbIH9kCWm/RQmVTSvBZ57ePnB8ALKNQsp6aJnPG+j4Sg8sOd2ekH0NCdUPObt/5btRaRtlkuwLp2FSUSsw+cmS+eKDY3ORsHtSa9gMllnckX/xfYn2KqjaLfzCMYjPQRWt0pghTIQCtheWiEBBAus1vjjnxNYzTqwYqGuVk5uEOreQXgYKzKQVGanGWQhHbM/CASL203xAcPdL/AGxuwDUVAsOciThJ7EIwhBlRQNIkRFQSXlBqrKaOhageyTaiHupIz1FJQJVPudHNQ5khB6BkU6CyQ0gMxE19KaFqqOE6QfPusKKo1WzD4StXEkSspA1BQGslRAnqA8voxp+CCZMpi+ov+OhkeiETtY3QpBXobuO3uKfFwleQWD06OXA2T9/KoaP4PRrQCftAJL9JyRhmKjPFSbsWaSE5lgEbTScB0DaRUhBpBqBpJLFCNMaN05LGR2whU9H1JvTuaqJRFqJUTFAbH2Viwp6kJ46Wkvv+5JNpbqgVt2TMElozbz7W56ugHGk4s8CEv31UCpksF1Pxo4+wmHBSTGVw+1TWN2okEW3+RTn3A0fo/i6V9dJaHZGRrApe9Qrn4dVNO8uorymB3B4fKnTs36VQNQ16gB5wrUKYBLQhzJyZ+5ruljh+tWiPX4L8AAhzPTbbKPzxYAAAAASUVORK5CYII="),
//       blending: THREE.AdditiveBlending,
//       transparent: true,
//       opacity: 0.4
//     });

//     for (p = 0; p < 50; p += 1) {
//       _x = Math.random() * 800 - 400;
//       _y = -500 + Math.random() * 500 - 250;
//       _z = -100 + Math.random() * 200;

//       vert = new THREE.Vector3(_x, _y, _z);
//       speed = 0.3 + Math.random() * 0.7;
//       vert.speed = speed;
//       vert.baseX = _x;

//       geometry.vertices.push(vert);
//     }

//     mesh = new THREE.ParticleSystem(geometry, material);
//     mesh.sortParticles = true;

//     this.mesh = mesh;
//   }

//   update() {
//     var p,
//       vert;
//     this.delta += 1;
//     for (p = 0; p < this.mesh.geometry.vertices.length; p += 1) {
//       vert = this.mesh.geometry.vertices[p];
//       vert.y += vert.speed;
//       vert.x = vert.baseX + Math.sin((this.delta * vert.speed) / 100) * 2;

//       if (vert.y > 0) {
//         vert.y -= 900;
//       }
//     }
//   }
// }

// class Beam {
//   constructor(b) {
//     var geometry,
//       material,
//       object,
//       wMaterial,
//       wGeometry,
//       edges,
//       scale,
//       multiplier,
//       radius = 500,
//       lineColor,
//       squareColor,
//       i,
//       x,
//       y,
//       z;

//     var colors = [{
//         lineColor: 0x00d8ff,
//         squareColor: 0xccccff
//       }, // blue
//       {
//         lineColor: 0xcc66ff,
//         squareColor: 0xcc99ff
//       }
//     ];

//     this.blue = b;
//     this.alternateColor = false;

//     if (this.blue) {
//       lineColor = colors[0].lineColor;
//       squareColor = colors[0].squareColor;
//     } else {
//       lineColor = colors[1].lineColor;
//       squareColor = colors[1].squareColor;
//     }

//     this.mesh = new THREE.Object3D();

//     //lines
//     wMaterial = new THREE.LineBasicMaterial({
//       color: lineColor,
//       linewidth: Math.random() * 4 + 2,
//       blending: THREE.AdditiveBlending,
//       transparent: true,
//       opacity: 0.4
//     });

//     wGeometry = new THREE.BoxGeometry(40, 40, 3000);

//     edges = new THREE.Line(wGeometry, wMaterial, THREE.LinePieces);
//     edges.rotation.x = Math.PI / 2;
//     this.mesh.add(edges);
//     this.edges = edges;

//     //square
//     material = new THREE.MeshBasicMaterial({
//       color: squareColor,
//       blending: THREE.AdditiveBlending,
//       transparent: true,
//       opacity: 0.9
//     });

//     geometry = new THREE.PlaneGeometry(40, 40);

//     object = new THREE.Mesh(geometry, material);
//     // object.rotation.x = Math.PI/2;
//     object.position.x = 1500;
//     this.mesh.add(object);
//     this.square = object;

//     //positioning
//     scale = 0.2 + Math.random() * 0.5;
//     z = -(radius / 2) + Math.random() * radius;
//     y = -(radius / 2) + Math.random() * radius;
//     x = Math.random() * 3500;

//     this.mesh.position.set(x, y, z);
//     this.mesh.scale.set(scale, scale, scale);
//   }

//   update(hide, alternate) {
//     var x = this.mesh.parent.position.x + this.mesh.position.x,
//       opacity;

//     if (x > 1500) {
//       this.mesh.position.x -= 3500;
//     }

//     opacity = (this.alternateColor && this.blue || !this.alternateColor && !this.blue) ? 0.2 : 1;

//     this.square.material.opacity = hide ? 0 : 0.9 * opacity;
//     this.edges.material.opacity = hide ? 0 : 0.4 * opacity;
//   }

// }

// class Beams {
//   constructor() {
//     var count = 400,
//       object,
//       i,
//       b;

//     this.shapes = [];
//     this.mesh = new THREE.Object3D();
//     this.mesh.position.set(0, 0, -500);

//     for (i = 0; i < count; i += 1) {
//       if (i % 2 === 0) {
//         b = true;
//       } else {
//         b = false;
//       }

//       object = new Beam(b);
//       this.mesh.add(object.mesh);
//       this.shapes.push(object);
//     }
//   }

//   update(d, currentText) {
//     var i,
//       hide,
//       alternateColor,
//       threshold;

//     this.mesh.position.x += 10;
//     threshold = Math.ceil((Math.sin(d * 2 - Math.PI / 2) * 0.51 + 0.5) * this.shapes.length);

//     for (i = 0; i < this.shapes.length; i += 1) {
//       this.shapes[i].update(i >= threshold, currentText);
//     }
//   }
// }

// class Text {
//   constructor(d) {
//     var attributes,
//       uniforms,
//       material,
//       geometry,
//       mesh,
//       i;

//     this.animating = false;
//     this.w = 1000;
//     this.h = 600;
//     this.delta = d || 0;
//     this.text1 = "LOVE";
//     this.text2 = "HATE";
//     this.currentText = 0;
//     this.textArray = [this.text1, this.text2];
//     this.textAttributes = [];

//     this.createScene();
//     this.createMask();
//     this.drawMask(this.delta);
//     this.updateMask();

//     attributes = {};

//     uniforms = {
//       map: {
//         type: "t",
//         value: this.texture
//       },
//       mask: {
//         type: "t",
//         value: this.mask
//       }
//     };

//     material = new THREE.ShaderMaterial({
//       uniforms: uniforms,
//       attributes: attributes,
//       vertexShader: document.getElementById('vertShader').innerText,
//       fragmentShader: document.getElementById('fragShader').innerText,
//       blending: THREE.AdditiveBlending,
//       transparent: true
//     });

//     geometry = new THREE.PlaneGeometry(10, 5, 1, 1);

//     mesh = new THREE.Mesh(geometry, material);
//     mesh.position.z = -10;
//     this.mesh = mesh;
//   }

//   createScene() {
//     var canvas,
//       w = this.w,
//       h = this.h,
//       i;

//     canvas = document.createElement('canvas');
//     //document.body.appendChild(canvas);
//     canvas.style.position = 'absolute';
//     canvas.style.top = '0';
//     canvas.style.left = '0';

//     this.scene = new THREE.Scene();
//     this.camera = new THREE.PerspectiveCamera(100, w / h, 1, 10000);
//     this.renderer = new THREE.WebGLRenderer({
//       antialias: true,
//       canvas: canvas
//     });

//     this.renderer.setSize(w, h);

//     this.beams = new Beams();
//     this.scene.add(this.beams.mesh);

//     this.texture = new THREE.Texture(canvas);

//     for (i = 0; i < this.textArray[0].length; i += 1) {
//       this.textAttributes.push({
//         rotation: Math.random() * 360,
//         rotationSpeed: Math.random() * 2 + 0.2,
//         scale: Math.random() * 360,
//         scaleSpeed: Math.random() * 2 + 0.2,
//         x: Math.random() * 360,
//         xSpeed: Math.random() * 3 + 0.5,
//         y: Math.random() * 360,
//         ySpeed: Math.random() * 3 + 0.5
//       });
//     }
//   }

//   createMask() {
//     var canvas;

//     canvas = document.createElement('canvas');
//     canvas.width = this.w;
//     canvas.height = this.h;
//     //document.body.appendChild(canvas);
//     canvas.style.position = 'absolute';
//     canvas.style.top = '0';
//     canvas.style.left = '0';

//     this.ctx = canvas.getContext('2d');
//     this.ctx.fillStyle = 'red';
//     this.ctx.font = "800 140px Proxima Nova, proxima-nova, sans-serif";
//     this.ctx.textAlign = "center";
//     this.ctx.textBaseline = "middle";

//     this.mask = new THREE.Texture(canvas);
//   }

//   drawMask() {
//     var i, x, y, att, letter, len, scale,
//       SPACER = 110,
//       R_RANGE = Math.PI / 8,
//       X_RANGE = 8,
//       Y_RANGE = 20,
//       S_RANGE = 0.2,
//       MULTIPLIER = 1.5,
//       DEG2RAD = Math.PI / 180;

//     this.ctx.clearRect(0, 0, this.w, this.h);
//     this.currentText = Math.sin(this.delta) > 0 ? 0 : 1;

//     len = this.textArray[this.currentText].length;

//     for (i = 0; i < len; i += 1) {
//       letter = this.textArray[this.currentText][i];
//       att = this.textAttributes[i];
//       x = -(SPACER * len) / 2.5 + i * SPACER + Math.sin(att.x * DEG2RAD) * X_RANGE;
//       y = Math.sin(att.y * DEG2RAD) * Y_RANGE;
//       scale = 1 + Math.sin(att.scale * DEG2RAD) * S_RANGE;
//       this.ctx.save();
//       this.ctx.translate(this.w / 2 + x * MULTIPLIER, this.h / 2 + y * MULTIPLIER);
//       this.ctx.scale(scale * MULTIPLIER, scale * MULTIPLIER);
//       this.ctx.rotate(Math.sin(att.rotation * DEG2RAD) * R_RANGE);
//       this.ctx.fillText(letter, 0, 0);
//       this.ctx.restore();
//     }
//   }

//   updateMask() {
//     var i,
//       att;

//     for (i = 0; i < this.textAttributes.length; i += 1) {
//       att = this.textAttributes[i];
//       att.rotation += att.rotationSpeed;
//       att.scale += att.scaleSpeed;
//       att.x += att.xSpeed;
//       att.y += att.ySpeed;
//     }

//     this.drawMask(this.delta);
//     this.mask.needsUpdate = true;
//   }

//   update() {
//     this.delta += 0.015;

//     this.beams.update(this.delta, this.currentText);
//     this.texture.needsUpdate = true;

//     this.updateMask();

//     this.renderer.render(this.scene, this.camera);
//   }
// }

// class World {

//   constructor() {
//     this.delta = 0;

//     this.scene = new THREE.Scene();
//     this.renderer = new THREE.WebGLRenderer({
//       antialias: true,
//       alpha: true
//     });
//     this.renderer.setClearColor(0x000000);
//     document.body.appendChild(this.renderer.domElement);
//     this.resize();

//     this.addCube();
//     this.addLight();

//     requestAnimationFrame(this.render.bind(this));
//     window.addEventListener('resize', this.resize.bind(this));
//   }

//   update() {
//     this.delta += 0.1;

//     this._text.update();
//     this._dust.update();
//   }

//   addLight() {
//     var ambient;
//     ambient = new THREE.AmbientLight(0x777777);
//     this.scene.add(ambient);
//   }

//   addCube() {
//     this._text = new Text(1);
//     this.scene.add(this._text.mesh);

//     this._dust = new Dust();
//     this._dust.mesh.position.y = 344;
//     this._dust.mesh.position.z = -1000;
//     this.scene.add(this._dust.mesh);
//   }

//   render() {
//     this.update();
//     requestAnimationFrame(this.render.bind(this));
//     this.renderer.render(this.scene, this.camera);
//   }

//   resize() {
//     this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);

//     this.renderer.setSize(window.innerWidth, window.innerHeight);
//   }
// }

// var _w = new World();