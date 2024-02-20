import {Matrix} from "ml-matrix";
import * as PIXI from 'pixi.js';

/**
 *
 * @param mat {Matrix}
 */
export function getCenterMatrix(mat) {
    const sumrows = mat.sum('row');
    return sumrows.map(sum => sum / mat.columns);
}
export function computeAngle(p1, p2) { //2 arrays
    return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}

export function slidertomat(slider) {
    const allPoints = slider.path.controlPoints.map((point) => [point.position.x, point.position.y]);
    return new Matrix(allPoints).transpose();
}

export function drawcp(graphic, mat) {
    const temp = mat.getColumn(0)
    graphic.moveTo(temp[0], temp[1]);
    for (let i = 0; i < mat.columns; i++) {
        const temp = mat.getColumn(i);
        graphic.lineTo(temp[0], temp[1]);
        graphic.drawRect(temp[0] - 3, temp[1] - 3, 6, 6)
    }
}

export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}
/**
 *
 * @param graphic {PIXI.Graphics}
 * @param mat {Matrix}
 */
export function drawBCurve(graphic, mat) {
    const marr = mat.to2DArray();
    graphic.moveTo(marr[0][0], marr[1][0])
        .bezierCurveTo(marr[0][1], marr[1][1], marr[0][2], marr[1][2], marr[0][3], marr[1][3]);
}

/**
 *
 * @param graphic {PIXI.Graphics}
 * @param mat {Matrix}
 */
export function drawQCurve(graphic, mat) {
    const marr = mat.to2DArray();
    graphic.moveTo(marr[0][0], marr[1][0])
        .quadraticCurveTo(marr[0][1], marr[1][1], marr[0][2], marr[1][2]);
}
/**
 *
 * @param graphic {PIXI.Graphics}
 * @param mat {Matrix}
 */
export function drawLine(graphic, mat) {
    const marr = mat.to2DArray();
    graphic.moveTo(marr[0][0], marr[1][0])
        .lineTo(marr[0][0], marr[1][0]);
}

export function getCenter(p1, p2, p3) {
    const a = p2[0] - p1[0]
    const b = p2[1] - p1[1]
    const c = p3[0] - p1[0]
    const d = p3[1] - p1[1]
    const e = a * (p1[0] + p2[0]) + b * (p1[1] + p2[1])
    const f = c * (p1[0] + p3[0]) + d * (p1[1] + p3[1])
    const g = 2 * (a * (p3[1] - p2[1]) - b * (p3[0] - p2[0]))
    return g === 0
        ? {
            x: (p1[0] + p2[0]) / 2,
            y: (p1[1] + p2[1]) / 2,
        }
        : {
            x: (d * e - b * f) / g,
            y: (a * f - c * e) / g,
        };
}

export function getDist(p1, p2) {//2 arrays
    const a = p1[0] - p2[0];
    const b = p1[1] - p2[1];
    return Math.hypot(a, b);
}