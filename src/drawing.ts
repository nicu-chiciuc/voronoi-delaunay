import { Triangle, Point, Line } from "./geom";

export const drawPoint = (ctx: CanvasRenderingContext2D, { x, y }: Point) => {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
};

export const drawLine = (ctx: CanvasRenderingContext2D, { p1, p2 }: Line) => {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();

  ctx.stroke();
};

export const drawTri = (
  ctx: CanvasRenderingContext2D,
  { p1, p2, p3 }: Triangle
) => {
  drawLine(ctx, { p1: p1, p2: p2 });
  drawLine(ctx, { p1: p2, p2: p3 });
  drawLine(ctx, { p1: p3, p2: p1 });
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  { center: { x, y }, rad }: Circle
) => {
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.closePath();

  ctx.stroke();
};
