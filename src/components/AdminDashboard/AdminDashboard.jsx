import { useEffect, useMemo, useState } from "react";
import {
  deleteProduction,
  getAdminOverview,
  updateProduction,
} from "../../services/api.js";
import { calcEarned, cupLabel, formatMoney } from "../../pricing.js";
import { dateKey, formatDateDdMmYyyy, toApiDateDdMmYyyy } from "../../date.js";
import { CUP_SIZES } from "../../constants/cupSizes.js";
import "./AdminDashboard.css";

function workerName(user) {
  if (!user) return "Невідомий працівник";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return full || user.username || `ID ${user.telegramId}`;
}

function AdminDashboard({ tg, setScreen, showError, setLoading }) {
  const [users, setUsers] = useState([]);
  const [productions, setProductions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    cupsCount: "",
    cupSize: "",
    cupType: "",
    date: "",
  });

  useEffect(() => {
    if (tg) {
      loadOverview();
    }
  }, [tg]);

  const loadOverview = async () => {
    if (!tg) return;

    try {
      setLoading(true);

      const data = await getAdminOverview(tg.initData);

      setUsers(data.users);
      setProductions(data.productions);
    } catch (response) {
      await showError(response);
    } finally {
      setLoading(false);
    }
  };

  const usersById = useMemo(() => {
    const map = {};
    for (const u of users) map[u.telegramId] = u;
    return map;
  }, [users]);

  const byWorker = useMemo(() => {
    const map = {};
    for (const item of productions) {
      const id = item.telegramId;
      if (!map[id]) map[id] = { items: [], earned: 0, cups: 0 };
      map[id].items.push(item);
      map[id].earned += calcEarned(item);
      map[id].cups += item.cupsCount;
    }
    return map;
  }, [productions]);

  const workerIds = Object.keys(byWorker).sort(
    (a, b) => byWorker[b].earned - byWorker[a].earned
  );

  const totalEarnedAll = workerIds.reduce(
    (sum, id) => sum + byWorker[id].earned,
    0
  );

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      cupsCount: String(item.cupsCount),
      cupSize: item.cupSize,
      cupType: item.cupType,
      date: dateKey(item.date),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    if (!tg) return;

    if (!editForm.cupsCount || Number(editForm.cupsCount) <= 0) {
      alert("Введіть кількість стаканів");
      return;
    }

    if (!editForm.cupSize) {
      alert("Оберіть розмір стакана");
      return;
    }

    if (!editForm.cupType) {
      alert("Оберіть тип стакана");
      return;
    }

    if (!editForm.date) {
      alert("Оберіть дату");
      return;
    }

    try {
      setLoading(true);
      await updateProduction(
        tg.initData,
        id,
        Number(editForm.cupsCount),
        editForm.cupSize,
        editForm.cupType,
        toApiDateDdMmYyyy(editForm.date)
      );
      setEditingId(null);
      await loadOverview();
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
      await loadOverview();
    } catch (response) {
      await showError(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Адмін-панель</h2>

      <div className="admin-buttons">
        <button onClick={() => setScreen("home")}>← Назад</button>
      </div>

      <hr />

      {workerIds.length === 0 ? (
        <p className="empty">📦 Поки немає записів</p>
      ) : (
        <>
          <p className="total-earned">
            <b>Всього по всіх працівниках:</b> {formatMoney(totalEarnedAll)}
          </p>

          {workerIds.map((id) => {
            const worker = byWorker[id];
            const user = usersById[id];
            const isOpen = expandedId === id;

            return (
              <div className="worker-card" key={id}>
                <button
                  className="worker-header"
                  onClick={() => setExpandedId(isOpen ? null : id)}
                >
                  <span className="worker-name">{workerName(user)}</span>
                  <span className="worker-summary">
                    {worker.cups} шт · {formatMoney(worker.earned)}
                  </span>
                </button>

                {isOpen && (
                  <div className="worker-details">
                    {worker.items
                      .slice()
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((item) => (
                        <div className="production-card" key={item._id}>
                          {editingId === item._id ? (
                            <>
                              <input
                                type="number"
                                placeholder="Кількість стаканів"
                                value={editForm.cupsCount}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, cupsCount: e.target.value })
                                }
                              />

                              <select
                                value={editForm.cupSize}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, cupSize: e.target.value })
                                }
                              >
                                <option value="">Оберіть розмір стакана</option>
                                {CUP_SIZES.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={editForm.cupType}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, cupType: e.target.value })
                                }
                              >
                                <option value="">Оберіть тип стакана</option>
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
                              <p><b>Дата:</b> {formatDateDdMmYyyy(item.date)}</p>
                              <p><b>Кількість:</b> {item.cupsCount}</p>
                              <p><b>Розмір:</b> {item.cupSize}</p>
                              <p><b>Тип:</b> {cupLabel(item)}</p>
                              <p><b>Зароблено:</b> {formatMoney(calcEarned(item))}</p>
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
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;