import { getPatternOptions } from "./pattern";
export function getBackgroundOptions(type) {
    return [
        {
            type: "select",
            key: "background.type",
            name: "Pattern",
            options: [
                { value: "none", label: "None" },
                { value: "image", label: "Image" },
                { value: "line", label: "Line" }
            ],
        },
        {
            type: "children",
            children: getBackgroundStyleOptions(type)
        }
    ];
}

function getBackgroundStyleOptions(type) {
    if (!type || type === "none") {
        return [
            {
                type: "color",
                key: "background.color",
                name: "Color"
            }
        ];
    } else if (type === "image") {
        return [
            {
                type: "image",
                key: "background.imageURL",
                name: "Image"
            }
        ];
    } else {
        return getPatternOptions(type, "background");
    }
}