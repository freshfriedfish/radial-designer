import {Matrix} from "ml-matrix";
import {computeAngle, drawcp, getCenter, getDist, slidertomat} from "./helpers.js";
import {BeatmapDecoder} from "osu-parsers";
import * as PIXI from "pixi.js";

/**
 *
 * @param g {PIXI.Graphics}
 * @param mat {Matrix}
 * @param lastSlider slider
 */
export function drawSlider(g, mat, lastSlider, circleFlag) {
    const lastSliderMat = mat.clone();
    const pathPoints = structuredClone(lastSlider.path.controlPoints);
    const types = pathPoints.map((ele) => {
        return ele.type;
    });
    const sliderType = types[0];
    const nestArr = []
    let eachArr = []
    types.forEach((ele) => {
        if (ele === 'B') {
            eachArr.push(ele);
            nestArr.push(eachArr)
            eachArr = [];
        } else {
            eachArr.push(ele);
        }
    });
    nestArr.push(eachArr)

    const vecArr = lastSliderMat.transpose().to2DArray().map((element) => {
        return new Matrix([element]);
    });

    const segments = nestArr.length;//4
    const lengths = nestArr.map(ele => ele.length); //1,3,1,3
    const chunks = [];
    let i, j;
    for (i = 0, j = 0; i < vecArr.length; i += lengths[j], j++) {
        chunks.push(vecArr.slice(i, i + lengths[j]));
    }
//text
//     textObj.x = chunks[0][0].to1DArray()[0] - 8
//     textObj.y = chunks[0][0].to1DArray()[1] - 15

//slider linestyles
    const sliderBorder = {
        width: 50,
        color: "white",
        cap: "round",
        join: "round",
        // alpha:.5,
    }
    const sliderBody = {
        width: 40,
        color: 0x2596be,
        cap: "round",
        join: "round",
        // alpha:.5,
    };
//the slider
    g.lineStyle(sliderBorder).moveTo(
        chunks[0][0].to1DArray()[0], chunks[0][0].to1DArray()[1]);
    for (let k = 0; k < chunks.length; k++) {
        switch (chunks[k].length) {
            case 1:
                g.lineTo(
                    chunks[k][0].to1DArray()[0], chunks[k][0].to1DArray()[1],)
                break;
            case 2:
                g.quadraticCurveTo(
                    chunks[k][0].to1DArray()[0], chunks[k][0].to1DArray()[1],
                    chunks[k][1].to1DArray()[0], chunks[k][1].to1DArray()[1],);
                break;
            case 3:
                if (sliderType === 'P') {
                    const cent = getCenter(lastSliderMat.getColumn(0), lastSliderMat.getColumn(1), lastSliderMat.getColumn(2));
                    const point1 = lastSliderMat.getColumn(0);
                    const point2 = lastSliderMat.getColumn(1);
                    const point3 = lastSliderMat.getColumn(2);
                    const radius = getDist([cent.x, cent.y], point2);
                    const startAng = computeAngle([cent.x, cent.y], point1);
                    const endAng = computeAngle([cent.x, cent.y], point3);
                    g.arc(cent.x, cent.y, radius, startAng, endAng);
                } else {
                    g.bezierCurveTo(
                        chunks[k][0].to1DArray()[0], chunks[k][0].to1DArray()[1],
                        chunks[k][1].to1DArray()[0], chunks[k][1].to1DArray()[1],
                        chunks[k][2].to1DArray()[0], chunks[k][2].to1DArray()[1],)
                }
                break;
        }
    }
    g.lineStyle(sliderBody).moveTo(
        chunks[0][0].to1DArray()[0], chunks[0][0].to1DArray()[1]);
    for (let k = 0; k < chunks.length; k++) {
        switch (chunks[k].length) {
            case 1:
                g.lineTo(
                    chunks[k][0].to1DArray()[0], chunks[k][0].to1DArray()[1],)
                break;
            case 2:
                g.quadraticCurveTo(
                    chunks[k][0].to1DArray()[0], chunks[k][0].to1DArray()[1],
                    chunks[k][1].to1DArray()[0], chunks[k][1].to1DArray()[1],)
                break;
            case 3:
                if (sliderType === 'P') {
                    const cent = getCenter(lastSliderMat.getColumn(0), lastSliderMat.getColumn(1), lastSliderMat.getColumn(2));
                    const point1 = lastSliderMat.getColumn(0);
                    const point2 = lastSliderMat.getColumn(1);
                    const point3 = lastSliderMat.getColumn(2);
                    const radius = getDist([cent.x, cent.y], point2);
                    const startAng = computeAngle([cent.x, cent.y], point1);
                    const endAng = computeAngle([cent.x, cent.y], point3);
                    g.arc(cent.x, cent.y, radius, startAng, endAng);
                } else {
                    g.bezierCurveTo(
                        chunks[k][0].to1DArray()[0], chunks[k][0].to1DArray()[1],
                        chunks[k][1].to1DArray()[0], chunks[k][1].to1DArray()[1],
                        chunks[k][2].to1DArray()[0], chunks[k][2].to1DArray()[1],)
                }
                break;
        }
    }

    g.lineStyle(sliderBorder).drawCircle(chunks[0][0].to1DArray()[0], chunks[0][0].to1DArray()[1], 1);
    g.lineStyle(sliderBody).drawCircle(chunks[0][0].to1DArray()[0], chunks[0][0].to1DArray()[1], 1);


}