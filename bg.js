// Animated background: an obsidian field with a faint, slowly drifting
// emerald glow, drawn with a WebGL fragment shader.
(function () {
  const SHADER = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float time = u_time * 0.3;

      // Obsidian field with a faint emerald glow — a rim of light, not a fill
      vec3 base  = vec3(0.035, 0.055, 0.047); // --bg          #090e0c
      vec3 glow  = vec3(0.063, 0.725, 0.506); // --emerald     #10b981
      vec3 crest = vec3(0.431, 0.906, 0.718); // --emerald-300 #6ee7b7

      float aurora = sin(uv.x * 3.0 + uv.y * 5.0 + time * 0.8) * 0.5 + 0.5;
      aurora *= pow(1.0 - uv.y, 1.5);

      vec3 finalColor = base + glow * aurora * 0.16;
      finalColor += crest * pow(aurora, 8.0) * 0.08;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // The glow is a soft gradient, so half resolution at 30fps looks the same
  // as full resolution at 60fps for a fraction of the GPU (and battery) cost
  const RESOLUTION_SCALE = 0.5;
  const FRAME_MS = 1000 / 30;

  const c = document.getElementById('bg-canvas');
  const gl = c.getContext('webgl');
  if (!gl) return; // no WebGL: the plain --bg body colour shows instead

  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, 'attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}');
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, SHADER);
  gl.compileShader(fs);

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const tLoc = gl.getUniformLocation(prog, 'u_time');
  const rLoc = gl.getUniformLocation(prog, 'u_resolution');

  function draw(t) {
    const w = Math.max(1, Math.round(window.innerWidth * RESOLUTION_SCALE));
    const h = Math.max(1, Math.round(window.innerHeight * RESOLUTION_SCALE));
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform1f(tLoc, t * 0.001);
    gl.uniform2f(rLoc, w, h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // Respect the OS "reduce motion" setting: draw one still frame and stop
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw(0);
    window.addEventListener('resize', () => draw(0));
    return;
  }

  let last = -Infinity;
  function loop(t) {
    requestAnimationFrame(loop);
    if (t - last < FRAME_MS) return;
    last = t;
    draw(t);
  }
  requestAnimationFrame(loop);
})();
