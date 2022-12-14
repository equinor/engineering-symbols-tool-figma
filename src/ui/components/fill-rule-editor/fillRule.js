let canvas; // document.querySelector("canvas");
let container; // = document.getElementById("container");
let c; // = canvas.getContext("2d");
let node;
let hover;
let prevMouse;

let nonzeroColor = "rgba(63, 159, 255, 0.25)";
let evenoddColor = "rgba(255, 127, 0, 0.25)";
let hoverNonzeroColor = nonzeroColor;
let hoverEvenoddColor = evenoddColor;
let geometryColor = "#777";
let hoverGeometryColor = "#000";

const canvasWidthMin = 450;
const canvasHeightMin = 410;

let canvasWidth = canvasWidthMin;
let canvasHeight = canvasHeightMin;

let zoomScale = 1;
let zoomPoint = null;

let holdingCtrlKey = false;
let holdingSpaceKey = false;
let mouseLeftDown = false;

let dragPoint = null;

let onNodeMutated = (nodeData) => {
  throw new Error("Callback 'onNodeMutated' not set!");
};

const onMouseMove = ({ target, clientX, clientY }) => {
  if (holdingSpaceKey && mouseLeftDown) {
    container.style.cursor = "grabbing";
    const dx = clientX - dragPoint.x;
    const dy = clientY - dragPoint.y;

    // Scroll
    container.scrollTop = dragPoint.top - dy;
    container.scrollLeft = dragPoint.left - dx;
    return;
  }
  if (holdingCtrlKey || holdingSpaceKey) return;
  // Get the bounding rectangle of target
  const rect = target.getBoundingClientRect();

  const x = clientX - rect.left;
  const y = clientY - rect.top;

  hover = hitTest({ x: x, y: y });

  draw();
};

const onMouseDown = ({ target, clientX, clientY }) => {
  mouseLeftDown = true;
  if (holdingSpaceKey) {
    dragPoint = {
      left: container.scrollLeft,
      top: container.scrollTop,
      x: clientX,
      y: clientY,
    };
    return;
  }
  const rect = target.getBoundingClientRect();

  const x = clientX - rect.left;
  const y = clientY - rect.top;
  hover = hitTest({ x: x, y: y });

  if (hover && hover.type === "loop") {
    node.vectorNetwork.regions[hover.regionIndex].loops[
      hover.loopIndex
    ].reverse();
    onNodeMutated(node);
  } else if (hover && hover.type === "region") {
    const region = node.vectorNetwork.regions[hover.regionIndex];
    region.windingRule =
      region.windingRule === "NONZERO" ? "EVENODD" : "NONZERO";
    onNodeMutated(node);
  }

  draw();
};

const onMouseUp = () => {
  mouseLeftDown = false;
};

const onWheel = (e) => {
  if (!holdingCtrlKey) return;
  e.preventDefault();

  const delta = e.deltaY < 0 ? 0.3 : -0.3;

  const newScale = zoomScale + delta;

  if (newScale > 5) zoomScale = 5;
  else if (newScale < 1) zoomScale = 1;
  else zoomScale += delta;

  canvasWidth = canvasWidthMin * zoomScale;
  canvasHeight = canvasHeightMin * zoomScale;

  if (zoomPoint == null) zoomPoint = { x: e.clientX, y: e.clientY };

  const cx = zoomPoint.x / canvasWidthMin;
  const cy = zoomPoint.y / canvasHeightMin;

  container.scrollLeft = canvasWidth * cx - canvasWidthMin * cx;
  container.scrollTop = canvasHeight * cy - canvasHeightMin * cy;

  draw();
};

const onKeyDown = (e) => {
  if (e.ctrlKey || e.metaKey) {
    holdingCtrlKey = true;
    return;
  }
  if (e.code === "Space") {
    holdingSpaceKey = true;
    container.style.cursor = "grab";
  }
};

const onKeyup = (e) => {
  if (e.key === "Control" || e.key === "Meta") {
    holdingCtrlKey = false;
    zoomPoint = null;
    return;
  }

  if (e.code === "Space") {
    holdingSpaceKey = false;
    container.style.cursor = "default";
  }
};

export function updateNode(nodeData) {
  if (!canvas || !c || !container || holdingCtrlKey || holdingSpaceKey) return;
  node = nodeData;
  hover = prevMouse ? hitTest(prevMouse) : null;
  draw();
}

export function setCanvas(cv) {
  if (!cv) return;
  if (canvas) {
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
  }
  canvas = cv;
  c = canvas.getContext("2d");

  // createDiagonalPattern(nonzeroColor, (x) => (nonzeroColor = x));
  // createDiagonalPattern(evenoddColor, (x) => (evenoddColor = x));
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
}

export function setOnNodeMutatedCallback(callback) {
  onNodeMutated = callback;
}

export function setContainer(ct) {
  if (!ct) return;
  if (container) {
    container.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyup);
  }
  container = ct;
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyup);
  container.addEventListener("wheel", onWheel);
}

function createDiagonalPattern(color, callback) {
  const img = new Image();
  img.onload = () => callback(c.createPattern(img, "repeat"));
  img.src =
    `data:image/svg+xml;base64,` +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
      <path fill="${color}" d="M0 4V0H4L12 8V12H8L0 4M12 4V0H8L12 4M0 12V8L4 12H0Z" />
    </svg>
  `);
}

function hasVertex(seg, index) {
  return seg.start === index || seg.end === index;
}

function startingVertex(network, loop) {
  const { segments } = network;

  // Special-case a loop consisting of a cubic segment that comes out from and
  // back to the same vertex
  if (loop.length === 1) {
    return segments[loop[0]].start;
  }

  // Make sure that the traversal works correctly even if the first segment
  // is oriented backwards compared to the second one
  const first = segments[loop[0]];
  const second = segments[loop[1]];

  let takeStart = hasVertex(second, first.end);
  let takeEnd = hasVertex(second, first.start);

  // There can be a figure 8 type arrangement, where the first and second
  // segments form a loop, but continues on
  if (takeStart && takeEnd && loop.length > 2) {
    const third = segments[loop[2]];
    takeStart = hasVertex(third, first.start);
  }

  if (takeStart) return first.start;
  if (takeEnd) return first.end;
  throw new Error("Failure in startingVertex");
}

function tangentForVertex(segment, index) {
  if (index === segment.start) return segment.tangentStart;
  if (index === segment.end) return segment.tangentEnd;
  throw new Error("Failure in tangentForVertex");
}

function otherVertex(segment, index) {
  if (index === segment.start) return segment.end;
  if (index === segment.end) return segment.start;
  throw new Error("Failure in otherVertex");
}

function* segmentIterator(network, loop) {
  const { vertices, segments } = network;
  let start = startingVertex(network, loop);

  for (const index of loop) {
    const segment = segments[index];
    const end = otherVertex(segment, start);
    const ts = tangentForVertex(segment, start);
    const te = tangentForVertex(segment, end);
    const s = vertices[start];
    const e = vertices[end];
    const cs = { x: s.x + ts.x, y: s.y + ts.y };
    const ce = { x: e.x + te.x, y: e.y + te.y };
    start = end;
    yield { s, cs, ce, e };
  }
}

function outlineLoop(tx, ty, network, loop) {
  let isFirst = true;
  for (const { s, cs, ce, e } of segmentIterator(network, loop)) {
    if (isFirst) {
      isFirst = false;
      c.moveTo(tx(s.x), ty(s.y));
    }
    c.bezierCurveTo(tx(cs.x), ty(cs.y), tx(ce.x), ty(ce.y), tx(e.x), ty(e.y));
  }
}

function cubic1D(a, b, c, d, t) {
  const s = 1 - t;
  return a * s * s * s + b * 3 * s * s * t + c * 3 * s * t * t + d * t * t * t;
}

function cubicDerivative1D(a, b, c, d, t) {
  const s = 1 - t;
  return (b - a) * 3 * s * s + (c - b) * 6 * s * t + (d - c) * 3 * t * t;
}

function createBoundingBox() {
  return {
    xmin: Infinity,
    ymin: Infinity,
    xmax: -Infinity,
    ymax: -Infinity,

    includePoint(x, y) {
      this.xmin = Math.min(this.xmin, x);
      this.ymin = Math.min(this.ymin, y);
      this.xmax = Math.max(this.xmax, x);
      this.ymax = Math.max(this.ymax, y);
    },

    containsPoint(point, threshold) {
      return (
        point.x >= this.xmin - threshold &&
        point.y >= this.ymin - threshold &&
        point.x <= this.xmax + threshold &&
        point.y <= this.ymax + threshold
      );
    },
  };
}

function drawVertex(x, y, color) {
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, 2, 0, Math.PI * 2, false);
  c.fill();
}

function drawSegment(sx, sy, csx, csy, cex, cey, ex, ey, color) {
  c.strokeStyle = color;
  c.beginPath();
  c.moveTo(sx, sy);
  c.bezierCurveTo(csx, csy, cex, cey, ex, ey);
  c.stroke();
}

function createTransformers(network) {
  const bb = createBoundingBox();

  for (let { x, y } of network.vertices) {
    bb.includePoint(x, y);
  }

  for (let {
    start: s,
    end: e,
    tangentStart: ts,
    tangentEnd: te,
  } of network.segments) {
    let { x: sx, y: sy } = network.vertices[s];
    let { x: ex, y: ey } = network.vertices[e];
    bb.includePoint(sx + ts.x, sy + ts.y);
    bb.includePoint(ex + te.x, ey + te.y);
  }

  const cx = (bb.xmin + bb.xmax) / 2;
  const cy = (bb.ymin + bb.ymax) / 2;
  const scale = Math.min(
    (canvasWidth - 50) / (bb.xmax - bb.xmin || 1),
    (canvasHeight - 50) / (bb.ymax - bb.ymin || 1)
  );

  function tx(x) {
    return canvasWidth / 2 + (x - cx) * scale;
  }
  function ty(y) {
    return canvasHeight / 2 + (y - cy) * scale;
  }
  function t({ x, y }) {
    return { x: tx(x), y: ty(y) };
  }

  return { t, tx, ty };
}

function draw() {
  const ratio = 1; //devicePixelRatio;
  canvas.width = Math.round(ratio * canvasWidth);
  canvas.height = Math.round(ratio * canvasHeight);
  c.scale(ratio, ratio);

  if (!node) {
    canvas.style.display = "none";
    //instructions.style.display = "block";
    return;
  }

  canvas.style.display = "block";
  //instructions.style.display = "none";

  const network = node.vectorNetwork;
  const { tx, ty } = createTransformers(network);

  // Regions
  let regionIndex = 0;
  for (const { windingRule, loops } of network.regions) {
    const isHovered =
      hover && hover.type === "region" && hover.regionIndex === regionIndex;

    if (isHovered) {
      c.fillStyle =
        windingRule === "NONZERO" ? hoverNonzeroColor : hoverEvenoddColor;
    } else {
      c.fillStyle = windingRule === "NONZERO" ? nonzeroColor : evenoddColor;
    }

    c.beginPath();
    for (const loop of loops) {
      outlineLoop(tx, ty, network, loop);
    }
    c.fill(windingRule.toLowerCase());
    regionIndex++;
  }

  // Segments
  for (const {
    start: s,
    end: e,
    tangentStart: ts,
    tangentEnd: te,
  } of network.segments) {
    const { x: sx, y: sy } = network.vertices[s];
    const { x: ex, y: ey } = network.vertices[e];
    drawSegment(
      tx(sx),
      ty(sy),
      tx(sx + ts.x),
      ty(sy + ts.y),
      tx(ex + te.x),
      ty(ey + te.y),
      tx(ex),
      ty(ey),
      geometryColor
    );
  }

  // Vertices
  for (const { x, y } of network.vertices) {
    drawVertex(tx(x), ty(y), geometryColor);
  }

  // Loop winding order
  regionIndex = 0;
  for (const { windingRule, loops } of network.regions) {
    let loopIndex = 0;

    for (const loop of loops) {
      const isHovered =
        hover &&
        hover.type === "loop" &&
        hover.regionIndex === regionIndex &&
        hover.loopIndex === loopIndex;
      c.fillStyle = isHovered ? hoverGeometryColor : geometryColor;

      for (const { s, cs, ce, e } of segmentIterator(network, loop)) {
        const t = 0.5;
        const x = tx(cubic1D(s.x, cs.x, ce.x, e.x, t));
        const y = ty(cubic1D(s.y, cs.y, ce.y, e.y, t));
        let dx = cubicDerivative1D(s.x, cs.x, ce.x, e.x, t);
        let dy = cubicDerivative1D(s.y, cs.y, ce.y, e.y, t);
        const len = Math.sqrt(dx * dx + dy * dy);
        dx *= 3 / len;
        dy *= 3 / len;
        c.beginPath();
        c.moveTo(x + dx, y + dy);
        c.lineTo(x - dx - dy, y - dy + dx);
        c.lineTo(x - dx + dy, y - dy - dx);
        c.fill();

        if (isHovered) {
          drawSegment(
            tx(s.x),
            ty(s.y),
            tx(cs.x),
            ty(cs.y),
            tx(ce.x),
            ty(ce.y),
            tx(e.x),
            ty(e.y),
            hoverGeometryColor
          );
          drawVertex(tx(s.x), ty(s.y), hoverGeometryColor);
          drawVertex(tx(e.x), ty(e.y), hoverGeometryColor);
        }
      }
      loopIndex++;
    }
    regionIndex++;
  }

  // Legend
  // const legendX = 150;
  // const legendY = canvasSize - 80; // innerHeight - 80;
  // const boxSize = 20;
  // const spacing = 8;

  // c.strokeStyle = 'black';
  // c.fillStyle = nonzeroColor;
  // c.beginPath();
  // c.rect(legendX, legendY, boxSize, boxSize);
  // c.fill();
  // c.stroke();
  // c.fillStyle = evenoddColor;
  // c.beginPath();
  // c.rect(legendX, legendY + boxSize + spacing, boxSize, boxSize);
  // c.fill();
  // c.stroke();

  // c.fillStyle = 'black';
  // c.font = '11px Inter, sans-serif';
  // c.textAlign = 'left';
  // c.textBaseline = 'middle';
  // c.fillText('Non-zero rule',
  //   legendX + boxSize + spacing,
  //   legendY + boxSize / 2);
  // c.fillText('Even-odd rule',
  //   legendX + boxSize + spacing,
  //   legendY + boxSize * 1.5 + spacing);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function subdivideCubic(a, b, c, d) {
  const ab = midpoint(a, b);
  const bc = midpoint(b, c);
  const cd = midpoint(c, d);
  const abc = midpoint(ab, bc);
  const bcd = midpoint(bc, cd);
  const abcd = midpoint(abc, bcd);
  return [
    [a, ab, abc, abcd],
    [abcd, bcd, cd, d],
  ];
}

function isPointNearCubic(s, cs, ce, e, point, threshold) {
  const bb = createBoundingBox();
  bb.includePoint(s.x, s.y);
  bb.includePoint(cs.x, cs.y);
  bb.includePoint(ce.x, ce.y);
  bb.includePoint(e.x, e.y);

  // Culling
  if (!bb.containsPoint(point, threshold)) {
    return false;
  }

  function visit(s, cs, ce, e, depth) {
    // Subdivision
    if (depth < 4) {
      const [[s1, cs1, ce1, e1], [s2, cs2, ce2, e2]] = subdivideCubic(
        s,
        cs,
        ce,
        e
      );
      return (
        visit(s1, cs1, ce1, e1, depth + 1) || visit(s2, cs2, ce2, e2, depth + 1)
      );
    }

    // Closest point to line
    const xse = e.x - s.x;
    const yse = e.y - s.y;
    const xsp = point.x - s.x;
    const ysp = point.y - s.y;
    let t = (xse * xsp + yse * ysp) / (xse * xse + yse * yse);
    t = Math.max(0, Math.min(1, t));

    // Distance check
    const dx = s.x + xse * t - point.x;
    const dy = s.y + yse * t - point.y;
    return dx * dx + dy * dy < threshold * threshold;
  }

  return visit(s, cs, ce, e, 0);
}

function isPointInsideRegion(t, tx, ty, network, region, point) {
  const bb = createBoundingBox();
  for (const loop of region.loops) {
    for (const { s, cs, ce, e } of segmentIterator(network, loop)) {
      bb.includePoint(tx(s.x), ty(s.y));
      bb.includePoint(tx(cs.x), ty(cs.y));
      bb.includePoint(tx(ce.x), ty(ce.y));
      bb.includePoint(tx(e.x), ty(e.y));
    }
  }

  // Culling
  if (!bb.containsPoint(point, 0)) {
    return false;
  }

  function visit(s, cs, ce, e, depth) {
    const xmax = Math.max(s.x, cs.x, ce.x, e.x);
    const ymin = Math.min(s.y, cs.y, ce.y, e.y);
    const ymax = Math.max(s.y, cs.y, ce.y, e.y);

    // Culling
    if (point.x > xmax || point.y < ymin || point.y > ymax) {
      return;
    }

    // Subdivision
    if (depth < 4) {
      const [[s1, cs1, ce1, e1], [s2, cs2, ce2, e2]] = subdivideCubic(
        s,
        cs,
        ce,
        e
      );
      visit(s1, cs1, ce1, e1, depth + 1);
      visit(s2, cs2, ce2, e2, depth + 1);
      return;
    }

    // Upward crossing
    if (s.y <= point.y && point.y < e.y) {
      const cross =
        (point.y - s.y) * (e.x - s.x) - (point.x - s.x) * (e.y - s.y);
      if (cross > 0) {
        crossingCount++;
      }
    }

    // Downward crossing
    else if (e.y <= point.y && point.y < s.y) {
      const cross =
        (point.y - s.y) * (e.x - s.x) - (point.x - s.x) * (e.y - s.y);
      if (cross < 0) {
        crossingCount--;
      }
    }
  }

  let crossingCount = 0;

  for (const loop of region.loops) {
    for (const { s, cs, ce, e } of segmentIterator(network, loop)) {
      visit(t(s), t(cs), t(ce), t(e), 0);
    }
  }

  if (region.windingRule === "EVENODD") {
    crossingCount &= 1;
  }

  return crossingCount !== 0;
}

function hitTest(point) {
  prevMouse = point;

  if (!node) {
    return null;
  }

  const network = node.vectorNetwork;
  const { t, tx, ty } = createTransformers(network);

  function hitTestLoops(threshold) {
    let regionIndex = 0;
    for (const { windingRule, loops } of network.regions) {
      let loopIndex = 0;
      for (const loop of loops) {
        for (const { s, cs, ce, e } of segmentIterator(network, loop)) {
          if (isPointNearCubic(t(s), t(cs), t(ce), t(e), point, threshold)) {
            return { type: "loop", regionIndex, loopIndex };
          }
        }
        loopIndex++;
      }
      regionIndex++;
    }
    return null;
  }

  // Hit-test loops
  const hit = hitTestLoops(2);
  if (hit !== null) {
    return hit;
  }

  // Hit-test regions
  let regionIndex = 0;
  for (const region of network.regions) {
    if (isPointInsideRegion(t, tx, ty, network, region, point)) {
      return { type: "region", regionIndex };
    }
    regionIndex++;
  }

  // Hit-test loops again
  return hitTestLoops(5);
}

// if (document.fonts && document.fonts.ready) {
//   document.fonts.ready.then(draw);
// } else {
//   draw();
// }
