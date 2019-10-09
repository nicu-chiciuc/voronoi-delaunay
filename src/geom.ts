import { guid } from "./utils";

export type Point = { x: number; y: number; id?: string };
export type Line = { p1: Point; p2: Point; id?: string };
export type LineFormula = { slope: number; n: number };
export type Circle = { center: Point; rad: number; id?: string };
export type Triangle = {
  p1: Point;
  p2: Point;
  p3: Point;
  id?: string;
  circum?: Circle;
  neighbors?: Triangle[];
};

export const sign = (p1: Point, p2: Point, p3: Point) => {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

export const pointInsideTriangle = ({ p1, p2, p3 }: Triangle, p: Point) => {
  const d1 = sign(p1, p2, p);
  const d2 = sign(p2, p3, p);
  const d3 = sign(p3, p1, p);

  const allPositive = d1 >= 0 && d2 >= 0 && d3 >= 0;
  const allNegative = d1 <= 0 && d2 <= 0 && d3 <= 0;

  return allPositive || allNegative;
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

export const triangleCircumcircle = (tri: Triangle): Circle => {
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

export const pointInsideCircle = (circle: Circle, point: Point): boolean => {
  return pointDist(circle.center, point) < circle.rad;
};
