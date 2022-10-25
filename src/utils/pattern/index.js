import { createContext } from "../canvas";
import { line } from "./line";
import { transformMatrix } from "../math";

export function createPattern(
    containerContext,
    { type, width = 50, height = 50, rotation = 0, ...options }
) {
    const canvas = document.createElement("canvas");
    const context = createContext(canvas, width, height);

    switch (type) {
        case "line":
            line(context, width, height, options);
            break;
    }

    const pattern = containerContext.createPattern(canvas, "repeat");
    const matrix = transformMatrix(2, rotation);
    pattern.setTransform(matrix);

    return pattern;
}