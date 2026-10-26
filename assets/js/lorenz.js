// Lorenz attractor traced behind the home-page hero panel.
// A single thin amber line integrates the Lorenz system and slowly rotates in 3D.
// Respects prefers-reduced-motion by drawing one static trace and stopping.
(function () {
  var canvas = document.querySelector(".hero-lorenz");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Lorenz parameters and integration state
  var sigma = 10,
    rho = 28,
    beta = 8 / 3;
  var x = 0.1,
    y = 0,
    z = 0;
  var dt = 0.006;
  var stepsPerFrame = 6;
  var maxPoints = 5000; // bounded trail so the frame cost stays flat
  var points = [];

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width = 0,
    height = 0;
  var angle = 0;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function step() {
    for (var i = 0; i < stepsPerFrame; i++) {
      var dx = sigma * (y - x);
      var dy = x * (rho - z) - y;
      var dz = x * y - beta * z;
      x += dx * dt;
      y += dy * dt;
      z += dz * dt;
      points.push([x, y, z]);
    }
    if (points.length > maxPoints) points.splice(0, points.length - maxPoints);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (points.length < 2) return;

    // Sit the attractor on the left, over the darker part of the photo, clear of the glass panel
    var scale = Math.min(width, height) / 52;
    var cx = width * 0.2;
    var cy = height * 0.5;
    var cosA = Math.cos(angle);
    var sinA = Math.sin(angle);

    ctx.lineWidth = 1.1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(217, 160, 102, 0.6)"; // site amber accent
    ctx.shadowColor = "rgba(217, 160, 102, 0.5)";
    ctx.shadowBlur = 5;

    ctx.beginPath();
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      // rotate about the vertical axis, then a gentle tilt so both lobes are visible
      var rx = p[0] * cosA - p[1] * sinA;
      var ry = p[0] * sinA + p[1] * cosA;
      var rz = p[2] - 27; // centre the attractor vertically
      var px = cx + rx * scale;
      var py = cy - (rz * 0.85 + ry * 0.35) * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  function frame() {
    step();
    angle += 0.0012;
    draw();
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    // one static trace, no animation
    for (var i = 0; i < maxPoints / stepsPerFrame; i++) step();
    draw();
    return;
  }

  // warm up so the attractor is already formed on first paint
  for (var j = 0; j < 400; j++) step();
  requestAnimationFrame(frame);
})();
