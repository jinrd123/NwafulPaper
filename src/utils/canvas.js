export function createContext(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = "1px solid #000";
    return canvas.getContext("2d");
}
export function drawColorWords(canvas, width, height, { fontSize, bgColor, textColor, title, fontFamily }) {
    let context = createContext(canvas, width, height);
    context.beginPath();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${fontSize}px ${fontFamily}`;
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);
    context.fillStyle = textColor;
    context.fillText(title, width / 2, height / 2);
}