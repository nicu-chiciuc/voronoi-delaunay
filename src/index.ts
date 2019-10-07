console.log("fuck");

type Point = { x: number; y: number; id?: string };
type Line = { p1: Point; p2: Point; id?: string };
type LineFormula = { slope: number; n: number };
type Circle = { center: Point; rad: number; id?: string };

type Triangle = { p1: Point; p2: Point; p3: Point; id?: string };

window.onload = event => {
  const canvas = document.getElementById("canvas");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext("2d");

  window.ctx = ctx;

  canvas.onclick = event => {
    const p: Point = {
      x: event.offsetX,
      y: event.offsetY,
      id: guid()
    };

    addPointToDelaunay(p);
  };

  const points: Point[] = [];

  points.forEach(point => {
    drawPoint(ctx, point);
  });

  const superTriangle: Triangle = {
    p1: { x: 400, y: 100, id: guid() },
    p2: { x: 100, y: 400, id: guid() },
    p3: { x: 700, y: 500, id: guid() },
    id: guid()
  };

  const triangles: Triangle[] = [superTriangle];

  redrawAll();

  // points.forEach(addPointToDelaunay);

  function addPointToDelaunay(point: Point) {
    points.push(point);
    // Find in what triangle it is now
    const triIndex = triangles.findIndex(tri => {
      return pointInsideTriangle(tri, point);
    });

    if (triIndex === -1) throw "Fuck";

    const tri = triangles[triIndex];

    const tri3: Triangle[] = [
      { p1: tri.p1, p2: tri.p2, p3: point, id: guid() },
      { p1: tri.p2, p2: tri.p3, p3: point, id: guid() },
      { p1: tri.p3, p2: tri.p1, p3: point, id: guid() }
    ];

    triangles.splice(triIndex, 1, ...tri3);

    redrawAll();
  }

  function redrawAll() {
    ctx.clearRect(0, 0, 800, 600);

    points.forEach(point => {
      drawPoint(ctx, point);
    });

    triangles.forEach(tri => {
      const c = triangleCircumcircle(tri);

      console.log(c);

      drawCircle(ctx, c);
      drawTri(ctx, tri);
    });
  }
};

const sign = (p1: Point, p2: Point, p3: Point) => {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

const pointInsideTriangle = ({ p1, p2, p3 }: Triangle, p: Point) => {
  const d1 = sign(p1, p2, p);
  const d2 = sign(p2, p3, p);
  const d3 = sign(p3, p1, p);

  const allPositive = d1 >= 0 && d2 >= 0 && d3 >= 0;
  const allNegative = d1 <= 0 && d2 <= 0 && d3 <= 0;

  return allPositive || allNegative;
};

const drawPoint = (ctx: CanvasRenderingContext2D, { x, y }: Point) => {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
};

const drawLine = (ctx: CanvasRenderingContext2D, { p1, p2 }: Line) => {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();

  ctx.stroke();
};

const drawTri = (ctx: CanvasRenderingContext2D, { p1, p2, p3 }: Triangle) => {
  drawLine(ctx, { p1: p1, p2: p2, id: guid() });
  drawLine(ctx, { p1: p2, p2: p3, id: guid() });
  drawLine(ctx, { p1: p3, p2: p1, id: guid() });
};

const drawCircle = (
  ctx: CanvasRenderingContext2D,
  { center: { x, y }, rad }: Circle
) => {
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.closePath();

  ctx.stroke();
};

const lineFormulaFromPoints = ({ p1, p2 }: Line): LineFormula => {
  const slope = (p2.y - p1.y) / (p2.x - p1.x);
  const n = p1.y - slope * p1.x;

  return { slope, n };
};

const segmentBisector = (l: Line) => {
  const { slope, n } = lineFormulaFromPoints(l);

  const { p1, p2 } = l;
  const middle: Point = {
    x: (p2.x + p1.x) / 2,
    y: (p2.y + p1.y) / 2,
    id: guid()
  };

  const d = (slope + 1 / slope) * middle.x + n;

  return { slope: -(1 / slope), n: d };
};

const triangleCircumcircle = (tri: Triangle): Circle => {
  const bis1 = segmentBisector({ p1: tri.p1, p2: tri.p2, id: guid() });
  const bis2 = segmentBisector({ p1: tri.p2, p2: tri.p3, id: guid() });

  const x = (bis2.n - bis1.n) / (bis1.slope - bis2.slope);
  const y = bis1.slope * x + bis1.n;

  const center: Point = { x, y, id: guid() };

  const rad = pointDist(tri.p1, center);

  return { rad, center, id: guid() };
};

const pointDist = (p1: Point, p2: Point): number => {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
};

const yFunc = (form: LineFormula, x: number): number => {
  return x * form.slope + form.n;
};

function guid() {
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  return S4() + "-" + S4();
}
