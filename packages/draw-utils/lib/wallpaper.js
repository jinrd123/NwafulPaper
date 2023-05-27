import { createPattern } from "./pattern";
import { createContext } from "./canvas";

export function drawWallpaper(canvas, width, height, options) {
  const context = createContext(canvas, width, height);
  const { text: textOptions, background: backgroundOptions } = options;
  drawBackground(context, width, height, backgroundOptions);
  drawText(context, width, height, textOptions);
}

function isColor(type) {
  return !type || type === "none";
}

function drawBackground(context, width, height, { type, image, color, ...options }) {
  if (type === "image") {
    drawImage(context, image, width, height);
  } else {
    const fillStyle = isColor(type)
      ? color
      : createPattern(context, { backgroundColor: color, type, ...options });
    context.fillStyle = fillStyle;
    context.fillRect(0, 0, width, height);
  }
}

function drawText(
  context,
  width,
  height,
  { color, type, fontSize, fontFamily, content, ...options }
) {
  const fillStyle = isColor(type)
    ? color
    : createPattern(context, { backgroundColor: color, type, ...options });
  context.font = `${fontSize}px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = fillStyle;
  // fillText与fillRect并无本质差别，fillText也是绘制一种图形，自然可以用fillStyle来进行装饰
  context.fillText(content, width / 2, height / 2);
}

// 以conver的模式确定图片的大小 & 居中在canvas上进行图片绘制
function drawImage(context, image, width, height) {
  const { width: imageWidth, height: imageHeight } = image;
  const imageAspect = imageHeight / imageWidth;
  const contextAspect = height / width;
  let sw, sh;
  if (imageAspect > contextAspect) {
    sw = imageWidth;
    sh = sw * contextAspect;
  } else {
    sh = imageHeight;
    sw = sh / contextAspect;
  }
  const sx = (imageWidth - sw) / 2;
  const sy = (imageHeight - sh) / 2;
  context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
}
