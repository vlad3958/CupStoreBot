import { useEffect, useMemo, useState } from "react";
import { getProductions, updateProduction } from "../../services/api.js";
import "./ProductionList.css";

const PRICES = {
  single: 5,  // копеек за однослойный стакан
  double: 10, // копеек за двухслойный стакан
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function dateKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
}

function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7; // Monday-first week

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
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
    item.cupType === "double" ? "Двухслойный" : "Однослойный";

  // группируем всю продукцию по дню: { "2026-07-06": { items: [...], earned: 120 } }
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
    .toLocaleString("ru-RU", { month: "long", year: "numeric" })
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
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    if (!tg) return;

    if (!editForm.cupsCount || Number(editForm.cupsCount) <= 0) {
      alert("Введите количество стаканов");
      return;
    }

    if (!editForm.cupSize.trim()) {
      alert("Введите размер стакана");
      return;
    }

    if (!editForm.cupType) {
      alert("Выберите тип стакана");
      return;
    }

    try {
      setLoading(true);

      await updateProduction(
        tg.initData,
        id,
        Number(editForm.cupsCount),
        editForm.cupSize,
        editForm.cupType
      );

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
      <h2>Продукция</h2>

      <div className="production-buttons">
        <button onClick={() => setScreen("home")}>
          ← Назад
        </button>

        <button onClick={() => setScreen("add")}>
          Добавить
        </button>
      </div>

      <hr />

      {productions.length === 0 ? (
        <p className="empty">
          📦 Пока нет записей
        </p>
      ) : (
        <>
          <p className="total-earned">
            <b>Всего заработано:</b> {totalEarned} коп.
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
                    {dayData && (
                      <span className="day-earned">{dayData.earned}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="month-total">
              <b>Итого за месяц:</b> {monthEarned} коп.
            </p>
          </div>

          <div className="day-details">
            {selectedDateObj && (
              <>
                <div className="day-details-header">
                  <span>
                    {selectedDateObj.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                  <button className="today-btn" onClick={goToday}>Сегодня</button>
                </div>

                {!selectedDayData ? (
                  <p className="empty small">Записей за этот день нет</p>
                ) : (
                  <>
                    {selectedDayData.items.map((item) => (
                      <div className="production-card" key={item._id}>
                        {editingId === item._id ? (
                          <>
                            <input
                              type="number"
                              placeholder="Количество стаканов"
                              value={editForm.cupsCount}
                              onChange={(e) =>
                                setEditForm({ ...editForm, cupsCount: e.target.value })
                              }
                            />

                            <input
                              type="text"
                              placeholder="Размер стакана"
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
                              <option value="">Выберите тип стакана</option>
                              <option value="single">Однослойный</option>
                              <option value="double">Двухслойный</option>
                            </select>

                            <div className="edit-buttons">
                              <button onClick={() => saveEdit(item._id)}>
                                ✅ Сохранить
                              </button>
                              <button onClick={cancelEdit}>
                                ✖ Отмена
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p>
                              <b>Количество:</b> {item.cupsCount}
                            </p>
                            <p>
                              <b>Размер:</b> {item.cupSize}
                            </p>
                            <p>
                              <b>Тип:</b> {cupLabel(item)}
                            </p>
                            <p>
                              <b>Заработано:</b> {calcEarned(item)} коп.
                            </p>
                            <p>
                              <b>Время:</b>{" "}
                              {new Date(item.date).toLocaleTimeString("ru-RU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>

                            <button
                              className="edit-btn"
                              onClick={() => startEdit(item)}
                            >
                              ✏️ Редактировать
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    <p className="day-total">
                      <b>Итого за день:</b> {selectedDayData.earned} коп.
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