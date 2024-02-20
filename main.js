import {Matrix} from "ml-matrix";
import {Pane} from "tweakpane";
import {BeatmapDecoder, BeatmapEncoder} from "osu-parsers";
import * as PIXI from 'pixi.js';
import textfile from "/public/a - pupa (Metal Wings) [rew].osu?raw";
import {drawBCurve, drawcp, drawQCurve, getCenterMatrix,} from "./helpers.js";
import {drawSlider} from "./slider.js";
import {Vector2} from "osu-classes";


let beatmap = new BeatmapDecoder().decodeFromString(textfile, true);
let lastSlider = beatmap.hitObjects[beatmap.hitObjects.length - 1].clone()
let copyMat;

const mapInfo = {
    slider: beatmap.hitObjects[0].clone(),
}

let controlPoints = new Matrix([[0, 16, 80, 96], [0, 32, 32, 0]]);
const app = new PIXI.Application({
    height: 960,
    width: 1280,
    background: '#d0ccfc',
    antialias: true,
});
app.stage.scale.set(2.5, 2.5);
document.body.appendChild(app.view);
const g = new PIXI.Graphics();
const container = new PIXI.Container()
container.addChild(g);
const gOther = new PIXI.Graphics();
app.stage.addChild(gOther);
container.filters = [new PIXI.AlphaFilter(.5)];
app.stage.addChild(container)

//12 text objects none of the text objects are implemented red
let textArr = []
for (let i = 0; i < 12; i++) {
    textArr.push(new PIXI.Text('', {
        font: 'bold italic 36px Arial',
        fill: '#FFFFFF',
        align: 'center',
    }));
}
const textObj = new PIXI.Text('', {
    font: 'bold italic 36px Arial',
    fill: '#FFFFFF',
});
app.stage.addChild(textObj);
textObj.resolution = 2;

const PARAMS = {
    welcome: 'Welcome to radial-designer!\nRead the README for usage details',
    copies: 3, dist: 50, rotate_local: 0, rotate_global: 0,
    exportedCopy: 'your export will show up here',
    anchor: 0,
    showCP: false,
};
const pane = new Pane({
    title: 'radial-designer', expanded: true,
});
pane.addBinding(PARAMS, 'welcome', {
    readonly: true, multiline: true, rows: 2, label: null,
});
((folder) => {
    folder.addBinding(PARAMS, 'copies', {step: 1, min: 1, max: 12,});
    folder.addBinding(PARAMS, 'dist', {step: 1, min: -300, max: 300, label: 'distance'});
    folder.addBinding(PARAMS, 'rotate_local', {step: 1, min: -180, max: 180, label: 'local rotation'});
    folder.addBinding(PARAMS, 'rotate_global', {step: 1, min: -180, max: 180, label: 'global rotation'});
})(pane.addFolder({
    title: 'parameters',
}));

((folder) => {
    folder.addButton({
        title: 'import',
    }).on('click', () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.style.opacity = '0';
        input.style.position = 'fixed';
        document.body.appendChild(input);
        input.addEventListener('input', () => {
            const file = input.files[0];
            document.body.removeChild(input);
            file.text().then(result => {
                const impbeatmap = new BeatmapDecoder().decodeFromString(result, true);
                beatmap = impbeatmap.clone();
                const finalObj = impbeatmap.hitObjects[impbeatmap.hitObjects.length - 1].clone();
                lastSlider = impbeatmap.hitObjects[impbeatmap.hitObjects.length - 1].clone();
                const allPoints = finalObj.path.controlPoints.map((point) => [point.position.x, point.position.y]);
                const firstMat = new Matrix(allPoints).transpose();
                controlPoints = firstMat.clone();
                mapInfo.bpm = impbeatmap.bpm;
                mapInfo.beatDiv = impbeatmap.editor.beatDivisor;
                mapInfo.slider = finalObj.clone();

            })
        }, {once: true})
        input.click();
    });
    folder.addButton({
        title: 'export',
    }).on('click', () => {

        //console.log(JSON.stringify(pane.exportState(), null, 4));
        // console.log(copyMat.to2DArray());
        // PARAMS.exportedCopy = copyMat.to2DArray();

        const rotateSingle = new Matrix([[Math.cos(degToRad(PARAMS.rotate_local)), -Math.sin(degToRad(PARAMS.rotate_local))], [Math.sin(degToRad(PARAMS.rotate_local)), Math.cos(degToRad(PARAMS.rotate_local))],]);
        const rotateAll = new Matrix([[Math.cos(degToRad(PARAMS.rotate_global)), -Math.sin(degToRad(PARAMS.rotate_global))], [Math.sin(degToRad(PARAMS.rotate_global)), Math.cos(degToRad(PARAMS.rotate_global))],]);
        const centralAngle = 360 / PARAMS.copies;
        const copyRotate = new Matrix([[Math.cos(degToRad(centralAngle)), -Math.sin(degToRad(centralAngle))], [Math.sin(degToRad(centralAngle)), Math.cos(degToRad(centralAngle))],]);
        let matCopy = new Matrix(controlPoints);
        // matCopy = rotateSingle.mmul(matCopy);
        matCopy.add(PARAMS.dist);
        // matCopy.addColumnVector([PARAMS.dist, 0]);
        matCopy = rotateAll.mmul(matCopy);
        copyMat = new Matrix(matCopy);
        let arrCopy = new Matrix(matCopy);
        const ms = 60000 / beatmap.bpm / beatmap.editor.beatDivisor * 2;
        for (let i = 0; i < PARAMS.copies; i++) {
            const lastSliderCopy = lastSlider.clone();
            arrCopy = copyRotate.mmul(arrCopy);
            arrCopy.addColumnVector([256, 192]).round();

            console.log(arrCopy.getColumn(0));
            const firstVec = arrCopy.getColumn(0);
            lastSliderCopy.startPosition = new Vector2(firstVec[0], firstVec[1]);
            arrCopy.subColumnVector(firstVec);
            //transforming matrix to slider
            const vector2straight = arrCopy.transpose().to2DArray().map((point) => new Vector2(point[0], point[1]));
            lastSliderCopy.path.controlPoints.forEach((point, index) => point.position = vector2straight[index].clone());

            lastSliderCopy.startTime += ms * (i+1);
            beatmap.hitObjects.push(lastSliderCopy);

            console.log(arrCopy.round().to2DArray());
            arrCopy.addColumnVector(firstVec);
            arrCopy.subColumnVector([256, 192]);
        }
        const beatmapStr = new BeatmapEncoder().encodeToString(beatmap).split('\n').splice(-PARAMS.copies-1);
        console.log(beatmapStr);
        let expStr = "";
        for (let i = 0; i < PARAMS.copies; i++) {
            expStr = expStr + beatmapStr[i] + '\n';
        }
        PARAMS.exportedCopy = expStr;
    });
    folder.addBinding(PARAMS, 'exportedCopy', {
        readonly: true, multiline: true, rows: 10, label: null,
    });
})(pane.addFolder({
    title: 'import/export',
}));
((folder) => {
    folder.addBinding(PARAMS, 'showCP', {label: 'show controlpoints'});
    folder.addButton({
        title: 'README',
    }).on('click', () => {
        window.open('https://github.com/freshfriedfish/radial-designer');
    });

})(pane.addFolder({
    title: 'misc',
}));
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.ticker.add(() => {
    const rotateSingle = new Matrix([[Math.cos(degToRad(PARAMS.rotate_local)), -Math.sin(degToRad(PARAMS.rotate_local))], [Math.sin(degToRad(PARAMS.rotate_local)), Math.cos(degToRad(PARAMS.rotate_local))],]);
    const rotateAll = new Matrix([[Math.cos(degToRad(PARAMS.rotate_global)), -Math.sin(degToRad(PARAMS.rotate_global))], [Math.sin(degToRad(PARAMS.rotate_global)), Math.cos(degToRad(PARAMS.rotate_global))],]);
    const centralAngle = 360 / PARAMS.copies;
    const copyRotate = new Matrix([[Math.cos(degToRad(centralAngle)), -Math.sin(degToRad(centralAngle))], [Math.sin(degToRad(centralAngle)), Math.cos(degToRad(centralAngle))],]);
    let matCopy = new Matrix(controlPoints);



    matCopy.subColumnVector(getCenterMatrix(matCopy));
    matCopy = rotateSingle.mmul(matCopy);
    matCopy.add(PARAMS.dist);
    // matCopy.addColumnVector([PARAMS.dist, 0]);
    matCopy = rotateAll.mmul(matCopy);

    copyMat = new Matrix(matCopy);

    g.clear();

    let arrCopy = new Matrix(matCopy);

    for (let i = 0; i < PARAMS.copies; i++) {
        arrCopy = copyRotate.mmul(arrCopy);
        arrCopy.addColumnVector([256, 192]);
        const startpos = arrCopy.getColumn(0);

        drawSlider(g, arrCopy, mapInfo.slider);
        textObj.x = startpos[0] - 8
        textObj.y = startpos[1] - 15

        arrCopy.subColumnVector([256, 192]);
    }

    if (PARAMS.showCP) {
        for (let i = 0; i < PARAMS.copies; i++) {
            arrCopy = copyRotate.mmul(arrCopy);
            arrCopy.addColumnVector([256, 192]);
            const startpos = arrCopy.getColumn(0);
            g.lineStyle(1, 0xFFFFFF)
                .moveTo(startpos[0], startpos[1]);
            drawcp(g, arrCopy);
            arrCopy.subColumnVector([256, 192]);
        }
    }

    gOther.lineStyle({width: 5, color: "white",})
        .drawRect(0, 0, 1024 / 2, 768 / 2);

});

//-------
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}
