export let InvalidCellsDisplayType = Object.freeze({
  NORMAL: "Чорний контур",
  INVISIBLE: "Невидимий",
  GRAYED_OUT: "Сірий колір",
});

export let BoardDisplayType = Object.freeze({
  GRID: "Сітка",
  CALENDAR: "Календар",
});

export let defaultBoardSettings = {
  showTodayMarker: true,
  invalidCellsDisplayType: InvalidCellsDisplayType.GRAYED_OUT,
  boardDisplayType: BoardDisplayType.CALENDAR,
  showDayNumber: false,
};

export let EmailStatus = Object.freeze({
  VERIFIED: "Перевірено",
  NOT_VERIFIED: "Не перевірено",
  NO_EMAIL: "Без електронної пошти",
});
