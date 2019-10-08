import { drawCircle, drawTri, drawPoint } from "./drawing";
import {
  triangleCircumcircle,
  Triangle,
  Point,
  pointInsideTriangle
} from "./geom";
import { guid } from "./utils";

console.log("fuck");

window.onload = event => {
  const canvas = document.getElementById("canvas");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext("2d");

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
