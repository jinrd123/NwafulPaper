import { createPattern } from "./pattern";
import { createContext } from "./canvas";

export function drawColorWords(...args) {
    drawWords("color", ...args);
}

export function drawPatternWords(...args) {
    drawWords("pattern", ...args);
}

export function drawImageWords(
    canvas,
    width,
    height,
    { fontSize, fontFamily, title, text, image }
  ) {
    const context = createContext(canvas, width, height);
    drawImage(context, image, width, height);
    drawTitle(context, title, width, height, text, fontSize, fontFamily);
}

function drawImage(context, image, width, height) {
    context.drawImage(image, 0, 0, width, height);
}

function drawTitle(context, title, width, height, text, fontSize, fontFamily) {
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${fontSize}px ${fontFamily}`;
    context.fillStyle = text;
    context.fillText(title, width / 2, height / 2);
}

export function drawWords(type, canvas, width, height, { fontSize, background, text, title, fontFamily }) {
    let context = createContext(canvas, width, height);
    const { backgroundFillStyle, textFillStyle } = chooseFillStyle(type, {
        background,
        text,
        context,
    });
    context.beginPath();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${fontSize}px ${fontFamily}`;
    context.fillStyle = backgroundFillStyle;
    context.fillRect(0, 0, width, height);
    context.fillStyle = textFillStyle;
    context.fillText(title, width / 2, height / 2);
}

function chooseFillStyle(type, { background, text, context }) {
    if (type === "color") {
        return {
            backgroundFillStyle: background,
            textFillStyle: text,
        };
    } else if (type === "pattern") {
        return {
            backgroundFillStyle: createPattern(context, background),
            textFillStyle: createPattern(context, text),
        };
    }
}

