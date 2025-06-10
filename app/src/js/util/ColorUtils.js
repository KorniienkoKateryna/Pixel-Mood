export let defaultColorSchemes = [
  [125, 125, 117, "Дуже поганий день"],
  [184, 183, 118, "Поганий день"],
  [175, 125, 197, "Посередній день"],
  [126, 252, 238, "День відпочинку"],
  [253, 250, 117, "Добрий день"],
  [253, 125, 236, "Дивовижний день"],
  [255, 171, 111, "Супер особливий день"],
];

// Supports #rrggbb or #rgb
export let parseHex = function (hex) {
  if (hex.length === 7) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    return [r, g, b];
  } else if (hex.length === 3) {
    let r = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
    let g = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
    let b = parseInt(hex.substring(3, 4) + hex.substring(3, 4), 16);

    return [r, g, b];
  }
};
