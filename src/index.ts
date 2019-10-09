import { intersection } from "remeda";

import { drawCircle, drawTri, drawPoint, drawLine } from "./drawing";
import {
  triangleCircumcircle,
  Triangle,
  Point,
  pointInsideTriangle,
  pointInsideCircle,
  sign,
  Line
} from "./geom";
import { guid } from "./utils";

window.onload = event => {
  const canvas = document.getElementById("canvas");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext("2d");

  canvas.onclick = event => {
    const p: Point = {
      x: event.offsetX + Math.random(),
      y: event.offsetY + Math.random(),
      id: guid()
    };

    addPointToDelaunay(p);
  };

  const points: Point[] = [];

  // const superTriangle: Triangle = {
  //   p1: { x: 100, y: 400, id: guid() },
  //   p2: { x: 400, y: 100, id: guid() },
  //   p3: { x: 700, y: 500, id: guid() },
  //   id: guid()
  // };

  const superTriangle: Triangle = {
    p1: { x: -1000, y: 1000, id: guid() },
    p2: { x: 400, y: -1000, id: guid() },
    p3: { x: 2000, y: 1000, id: guid() },
    id: guid()
  };

  const triangles: Triangle[] = [superTriangle];
  // window.triangles = triangles;

  refresh();
  initialAdd();

  function initialAdd() {
    const rx = () => Math.random() * 800;
    const ry = () => Math.random() * 600;
    const rp = (): Point => ({ x: rx(), y: ry(), id: guid() });

    addPointToDelaunay(rp());
    addPointToDelaunay(rp());
    addPointToDelaunay(rp());
  }

  function refresh() {
    checkIfTrianglesAreRightSided();

    recalculateCircumcircles();
    findNeighbors();

    redrawAll();
  }

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

    refresh();
  }

  function checkFlipTriangle(tri: Triangle, point: Point) {
    // Find triangle with edge oposed to current point

    const justTwo = (() => {
      const { p1, p2, p3 } = tri;
      return [p1, p2, p3].filter(p => p.id !== point.id);
    })();

    if (justTwo.length !== 2) {
      console.error(
        "checkFlipTriangle point should be inside the passed Triangle"
      );
      return;
    }

    const [p1, p2] = justTwo;

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
          if (sign(tt.p1, tt.p2, tt.p3) < 0) {
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

  function recalculateCircumcircles() {
    triangles.forEach(triangle => {
      triangle.circum = triangleCircumcircle(triangle);
    });
  }

  function findNeighbors() {
    triangles.forEach(triangle => {
      const neighs = triangles.filter(tri => {
        return triangleCommonEdge(tri, triangle);
      });

      triangle.neighbors = neighs;
    });
  }

  function checkIfTrianglesAreRightSided() {
    triangles.forEach(triangle => {
      const { p1, p2, p3 } = triangle;
      const sig = sign(p1, p2, p3);
      // console.log(sig);
      if (sig < 0) {
        console.error("sign is negative");

        // triangle.p2 = p3;
        // triangle.p3 = p2;
      }
    });
  }

  function linesBetweenCircumcircles() {
    triangles.forEach(triangle => {
      if (!triangle.neighbors || !triangle.circum) {
        console.error("no neighbors or circum");
        return;
      }

      triangle.neighbors.forEach(neigh => {
        if (!neigh.circum) throw "no neigh circum";

        drawLine(ctx, { p1: triangle.circum.center, p2: neigh.circum.center });
      });
    });
  }

  function triangleCommonEdge(tri1: Triangle, tri2: Triangle): Line | null {
    const tri1Ids = [tri1.p1.id, tri1.p2.id, tri1.p3.id];
    const tri2Ids = [tri2.p1.id, tri2.p2.id, tri2.p3.id];

    const common = intersection(tri1Ids, tri2Ids);

    if (common.length === 2) {
      const points = [tri1.p1, tri1.p2, tri1.p3];
      return {
        p1: points.find(x => x.id === common[0]),
        p2: points.find(x => x.id === common[1])
      };
    }

    return null;
  }

  function redrawAll() {
    ctx.clearRect(0, 0, 800, 600);

    ctx.strokeStyle = "black";
    linesBetweenCircumcircles();

    points.forEach(point => {
      drawPoint(ctx, point);
    });

    ctx.strokeStyle = "red";

    triangles.forEach(tri => {
      const c = triangleCircumcircle(tri);

      // drawCircle(ctx, c);
      const { p1, p2, p3 } = tri;
      const { p1: s1, p2: s2, p3: s3 } = superTriangle;

      // drawCircle(ctx, c)

      // drawTri(ctx, tri);
    });
  }
};
