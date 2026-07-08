import { useEffect, useMemo, useState } from "react";
import { getAdminOverview } from "../../services/api.js";
import { calcEarned, cupLabel, formatMoney } from "../../pricing.js";
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
                          <p><b>Дата:</b> {new Date(item.date).toLocaleDateString("uk-UA")}</p>
                          <p><b>Кількість:</b> {item.cupsCount}</p>
                          <p><b>Розмір:</b> {item.cupSize}</p>
                          <p><b>Тип:</b> {cupLabel(item)}</p>
                          <p><b>Зароблено:</b> {formatMoney(calcEarned(item))}</p>
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