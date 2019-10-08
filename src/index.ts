import { drawCircle, drawTri, drawPoint } from "./drawing";
import {
  triangleCircumcircle,
  Triangle,
  Point,
  pointInsideTriangle,
  pointInsideCircle,
  sign
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
  window.triangles = triangles;

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

    tri3.forEach(tri => {
      checkFlipTriangle(tri, point);
    });

    redrawAll();
  }

  function checkFlipTriangle(tri: Triangle, point: Point) {
    // Find triangle with edge oposed to current point
    const { p1, p2 } = tri;

    const ind = triangles.findIndex(t => {
      return (
        t.id !== tri.id &&
        [t.p1.id, t.p2.id, t.p3.id].includes(p1.id) &&
        [t.p1.id, t.p2.id, t.p3.id].includes(p2.id)
      );
    });

    if (ind !== -1) {
      const triOther = triangles[ind];
      const otherPoint = [triOther.p1, triOther.p2, triOther.p3].filter(
        p => ![p1.id, p2.id].includes(p.id)
      )[0];

      const c = triangleCircumcircle(tri);

      // WARN: This operation should be recursiv
      if (pointInsideCircle(c, otherPoint)) {
        const flippedTriangles: Triangle[] = [
          // WARN: the triangles are not clockwise
          { p1: p1, p2: point, p3: otherPoint, id: guid() },
          { p1: p2, p2: point, p3: otherPoint, id: guid() }
        ].map(tt => {
          if (sign(tt.p1, tt.p2, tt.p3) > 0) {
            return { p1: tt.p1, p2: tt.p3, p3: tt.p2, id: tt.id };
          }

          return tt;
        });

        // Existing triangle
        triangles.splice(ind, 1);

        const ii = triangles.findIndex(t => t.id === tri.id);
        // Just added triangles
        triangles.splice(ii, 1);

        triangles.push(...flippedTriangles);

        // Recursive other maybe possibilities
        checkFlipTriangle(flippedTriangles[0], point);
        checkFlipTriangle(flippedTriangles[1], point);
      }
    }
  }

  function redrawAll() {
    ctx.clearRect(0, 0, 800, 600);

    points.forEach(point => {
      // drawPoint(ctx, point);
    });

    triangles.forEach(tri => {
      const c = triangleCircumcircle(tri);

      // drawCircle(ctx, c);
      drawTri(ctx, tri);
    });
  }
};
