import { useEffect, useMemo, useState } from "react";
import { getProductions, updateProduction, deleteProduction } from "../../services/api.js";
import "./ProductionList.css";

const PRICES = {
  single: 5,  // копійок за одношарову склянку
  double: 10, // копійок за двошарову склянку
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

function dateKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
}

function toDateInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7; // тиждень з понеділка

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function formatMoney(kopecks) {
  return `${(kopecks / 100).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} грн`;
}

function ProductionList({
  tg,
  setScreen,
  showError,
  setLoading,
}) {
  const [productions, setProductions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(() => dateKey(new Date()));

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    cupsCount: "",
    cupSize: "",
    cupType: "",
    date: "",
  });

  useEffect(() => {
    if (tg) {
      loadProductions();
    }
  }, [tg, screen]);

  const loadProductions = async () => {
    if (!tg) return;

    try {
      setLoading(true);

      const data = await getProductions(tg.initData);

      setProductions(data.productions);
    } catch (response) {
      await showError(response);
    } finally {
      setLoading(false);
    }
  };

  const calcEarned = (item) => {
    const price = PRICES[item.cupType] || 0;
    return price * item.cupsCount;
  };

  const cupLabel = (item) =>
    item.cupType === "double" ? "Двошаровий" : "Одношаровий";

  // групуємо всю продукцію по днях: { "2026-07-06": { items: [...], earned: 120 } }
  const byDay = useMemo(() => {
    const map = {};
    for (const item of productions) {
      const key = dateKey(item.date);
      if (!map[key]) map[key] = { items: [], earned: 0 };
      map[key].items.push(item);
      map[key].earned += calcEarned(item);
    }
    return map;
  }, [productions]);

  const totalEarned = productions.reduce((sum, item) => sum + calcEarned(item), 0);

  const monthCells = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);

  const monthEarned = monthCells.reduce((sum, day) => {
    if (!day) return sum;
    return sum + (byDay[dateKey(day)]?.earned || 0);
  }, 0);

  const goPrevMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

  const goToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(dateKey(now));
  };

  const monthLabel = currentMonth
    .toLocaleString("uk-UA", { month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());

  const todayKey = dateKey(new Date());
  const selectedDayData = selectedDay ? byDay[selectedDay] : null;
  const selectedDateObj = selectedDay ? new Date(selectedDay) : null;

const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      cupsCount: String(item.cupsCount),
      cupSize: item.cupSize,
      cupType: item.cupType,
      date: toDateInputValue(item.date),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    if (!tg) return;

    if (!editForm.cupsCount || Number(editForm.cupsCount) <= 0) {
      alert("Введіть кількість склянок");
      return;
    }

    if (!editForm.cupSize.trim()) {
      alert("Введіть розмір склянки");
      return;
    }

    if (!editForm.cupType) {
      alert("Оберіть тип склянки");
      return;
    }

    if (!editForm.date) {
      alert("Оберіть дату");
      return;
    }

    const [year, month, day] = editForm.date.split("-").map(Number);
    const dateValue = new Date(year, month - 1, day);

    try {
      setLoading(true);

      await updateProduction(
        tg.initData,
        id,
        Number(editForm.cupsCount),
        editForm.cupSize,
        editForm.cupType,
        dateValue
      );

      setEditingId(null);
      await loadProductions();
    } catch (response) {
      await showError(response);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!tg) return;

    const confirmed = window.confirm("Видалити цей запис? Дію не можна скасувати.");

    if (!confirmed) return;

    try {
      setLoading(true);

      await deleteProduction(tg.initData, id);

      setEditingId(null);
      await loadProductions();
    } catch (response) {
      await showError(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="production-list">
      <h2>Продукція</h2>

      <div className="production-buttons">
        <button onClick={() => setScreen("home")}>
          ← Назад
        </button>

        <button onClick={() => setScreen("add")}>
          Додати
        </button>
      </div>

      <hr />

      {productions.length === 0 ? (
        <p className="empty">
          📦 Поки немає записів
        </p>
      ) : (
        <>
          <p className="total-earned">
            <b>Всього зароблено:</b> {formatMoney(totalEarned)}
          </p>

          <div className="calendar">
            <div className="calendar-nav">
              <button className="nav-btn" onClick={goPrevMonth}>‹</button>
              <span className="calendar-month">{monthLabel}</span>
              <button className="nav-btn" onClick={goNextMonth}>›</button>
            </div>

            <div className="calendar-weekdays">
              {WEEKDAYS.map((w) => (
                <span key={w} className="weekday">{w}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {monthCells.map((day, i) => {
                if (!day) {
                  return <div key={`blank-${i}`} className="calendar-cell blank" />;
                }

                const key = dateKey(day);
                const dayData = byDay[key];
                const isSelected = selectedDay === key;
                const isToday = key === todayKey;

                return (
                  <button
                    key={key}
                    className={
                      "calendar-cell" +
                      (dayData ? " has-data" : "") +
                      (isSelected ? " selected" : "") +
                      (isToday ? " today" : "")
                    }
                    onClick={() => setSelectedDay(key)}
                  >
                    <span className="day-number">{day.getDate()}</span>
                  </button>
                );
              })}
            </div>

            <p className="month-total">
              <b>Разом за місяць:</b> {formatMoney(monthEarned)}
            </p>
          </div>

          <div className="day-details">
            {selectedDateObj && (
              <>
                <div className="day-details-header">
                  <span>
                    {selectedDateObj.toLocaleDateString("uk-UA", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                  <button className="today-btn" onClick={goToday}>Сьогодні</button>
                </div>

                {!selectedDayData ? (
                  <p className="empty small">Записів за цей день немає</p>
                ) : (
                  <>
                    {selectedDayData.items.map((item) => (
                      <div className="production-card" key={item._id}>
                        {editingId === item._id ? (
                          <>
                            <input
                              type="number"
                              placeholder="Кількість склянок"
                              value={editForm.cupsCount}
                              onChange={(e) =>
                                setEditForm({ ...editForm, cupsCount: e.target.value })
                              }
                            />

                            <input
                              type="text"
                              placeholder="Розмір склянки"
                              value={editForm.cupSize}
                              onChange={(e) =>
                                setEditForm({ ...editForm, cupSize: e.target.value })
                              }
                            />

                            <select
                              value={editForm.cupType}
                              onChange={(e) =>
                                setEditForm({ ...editForm, cupType: e.target.value })
                              }
                            >
                              <option value="">Оберіть тип стакану</option>
                              <option value="single">Одношаровий</option>
                              <option value="double">Двошаровий</option>
                            </select>

                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) =>
                                setEditForm({ ...editForm, date: e.target.value })
                              }
                            />

                            <div className="edit-buttons">
                              <button onClick={() => saveEdit(item._id)}>
                                ✅ Зберегти
                              </button>
                              <button onClick={cancelEdit}>
                                ✖ Скасувати
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDelete(item._id)}
                              >
                                🗑 Видалити
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p>
                              <b>Кількість:</b> {item.cupsCount}
                            </p>
                            <p>
                              <b>Розмір:</b> {item.cupSize}
                            </p>
                            <p>
                              <b>Тип:</b> {cupLabel(item)}
                            </p>
                            <p>
                              <b>Зароблено:</b> {formatMoney(calcEarned(item))}
                            </p>

                            <button
                              className="edit-btn"
                              onClick={() => startEdit(item)}
                            >
                              ✏️ Редагувати
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    <p className="day-total">
                      <b>Разом за день:</b> {formatMoney(selectedDayData.earned)}
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductionList;