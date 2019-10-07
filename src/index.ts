console.log("fuck");

type Point = { x: number; y: number };
type Line = [Point, Point];

type Triangle = [Point, Point, Point];

window.onload = event => {
  const canvas = document.getElementById("canvas");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext("2d");

  canvas.onclick = event => {
    const p: Point = {
      x: event.offsetX,
      y: event.offsetY
    };

    drawPoint(ctx, p);
  };

  const points: Point[] = [
    { x: 372, y: 206 },
    { x: 528, y: 348 },
    { x: 615, y: 452 },
    { x: 128, y: 536 },
    { x: 242, y: 396 },
    { x: 326, y: 510 },
    { x: 513, y: 544 },
    { x: 459, y: 428 },
    { x: 326, y: 379 },
    { x: 488, y: 244 }
  ];

  points.forEach(point => {
    drawPoint(ctx, point);
  });

  const superTriangle: Triangle = [
    { x: 400, y: 5 },
    { x: 5, y: 595 },
    { x: 790, y: 595 }
  ];

  drawTri(ctx, superTriangle);

  console.log(canvas);
};

const sign = (p1: Point, p2: Point, p3: Point) => {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

const pointInsideTriangle = ([t1, t2, t3]: Triangle, p: Point) => {
  const d1 = sign(t1, t2, p);
  const d2 = sign(t2, t3, p);
  const d3 = sign(t3, t1, p);

  const allPositive = d1 >= 0 && d2 >= 0 && d3 >= 0;
  const allNegative = d1 <= 0 && d2 <= 0 && d3 <= 0;

  return allPositive || allNegative;
};

const drawPoint = (ctx: CanvasRenderingContext2D, { x, y }: Point) => {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
};

const drawLine = (ctx: CanvasRenderingContext2D, [p1, p2]: Line) => {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
};

const drawTri = (ctx: CanvasRenderingContext2D, [p1, p2, p3]: Triangle) => {
  drawLine(ctx, [p1, p2]);
  drawLine(ctx, [p2, p3]);
  drawLine(ctx, [p3, p1]);
};
