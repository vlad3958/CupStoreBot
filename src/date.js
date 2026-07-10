const pad = (n) => String(n).padStart(2, "0");

function parseDateValue(value) {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) {
      const [, year, month, day] = ymd;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmy) {
      const [, day, month, year] = dmy;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }
  return new Date(value);
}

export function dateKey(d) {
  const dt = parseDateValue(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function formatDateDdMmYyyy(d) {
  const dt = parseDateValue(d);
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

export function toApiDateDdMmYyyy(ymdDate) {
  const dt = parseDateValue(ymdDate);
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

export function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}