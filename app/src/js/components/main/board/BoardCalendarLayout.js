import {
  FULL_MONTH_NAMES,
  ABBR_WEEKDAY_NAMES,
  DAYS_PER_MONTH
} from "js/components/main/Constants";
import { getDayOfWeek, isLeapYear } from "js/util/DateUtils";

function getTable(month, year, getCell) {
  let tableData = [];
  let firstDay = getDayOfWeek(month, 1, year);
  let numDays = DAYS_PER_MONTH[month] + (month === 1 && isLeapYear(year) ? 1 : 0);

  for (let w = 0; w < 6; w++) {
    let rowData = [];
    if (w * 7 - firstDay >= numDays) {
      break;
    }

    for (let d = 0; d < 7; d++) {
      let dayOfMonth = w * 7 + d - firstDay;

      rowData.push(getCell(month, dayOfMonth));
    }

    tableData.push(<tr key={w}>{rowData}</tr>);
  }

  return (
    <table>
      <thead className="text-center" style={{ fontSize: "0.9rem" }}>
        <tr>
          {ABBR_WEEKDAY_NAMES.map((value, index) => {
            return (
              <th key={index} className="pb-1">
                {value}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>{tableData}</tbody>
    </table>
  );
}

export default function getBoardCalendarLayout(getCell, year) {
  let calendarData = [];

  for (let m = 0; m < 12; m++) {
    calendarData.push(
      <div key={m} className="mx-3 my-2">
        <h4>{FULL_MONTH_NAMES[m]}</h4>
        {getTable(m, year, getCell)}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {calendarData}
    </div>
  );
}
