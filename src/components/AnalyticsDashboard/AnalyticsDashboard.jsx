import { useEffect, useMemo, useState } from "react";
import { getAdminOverview, getProductions } from "../../services/api.js";
import { calcEarned, formatMoney } from "../../pricing.js";
import { dateKey, formatDateDdMmYyyy } from "../../date.js";
import "./AnalyticsDashboard.css";

function workerName(user) {
  if (!user) return "Невідомий працівник";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return full || user.username || `ID ${user.telegramId}`;
}

function buildDailySeries(items) {
  const byDay = {};

  for (const item of items) {
    const day = dateKey(item.date);

    if (!byDay[day]) {
      byDay[day] = { day, cups: 0, earned: 0 };
    }

    byDay[day].cups += item.cupsCount;
    byDay[day].earned += calcEarned(item);
  }

  return Object.values(byDay)
    .sort((a, b) => a.day.localeCompare(b.day))
    .map((row) => ({
      ...row,
      label: formatDateDdMmYyyy(row.day),
    }));
}

function DailyChart({ title, series }) {
  const maxCups = Math.max(...series.map((row) => row.cups), 1);
  const maxEarned = Math.max(...series.map((row) => row.earned), 1);

  return (
    <div className="chart-block">
      <h4>{title}</h4>

      <div className="chart-legend">
        <span><i className="dot cups" />Зроблено (шт)</span>
        <span><i className="dot earned" />Зароблено</span>
      </div>

      <div className="chart-rows">
        {series.map((row) => (
          <div key={row.day} className="chart-row">
            <div className="chart-date">{row.label}</div>

            <div className="chart-bars">
              <div className="bar-line">
                <div
                  className="bar cups"
                  style={{ width: `${(row.cups / maxCups) * 100}%` }}
                />
                <span>{row.cups} шт</span>
              </div>

              <div className="bar-line">
                <div
                  className="bar earned"
                  style={{ width: `${(row.earned / maxEarned) * 100}%` }}
                />
                <span>{formatMoney(row.earned)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsDashboard({ tg, isAdmin, setScreen, showError, setLoading }) {
  const [users, setUsers] = useState([]);
  const [productions, setProductions] = useState([]);

  useEffect(() => {
    if (!tg) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        if (isAdmin) {
          const data = await getAdminOverview(tg.initData);
          setUsers(data.users || []);
          setProductions(data.productions || []);
        } else {
          const data = await getProductions(tg.initData);
          setProductions(data.productions || []);
        }
      } catch (response) {
        await showError(response);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [tg, isAdmin]);

  const personalSeries = useMemo(() => buildDailySeries(productions), [productions]);

  const totalCups = personalSeries.reduce((sum, row) => sum + row.cups, 0);
  const totalEarned = personalSeries.reduce((sum, row) => sum + row.earned, 0);

  const usersById = useMemo(() => {
    const map = {};
    for (const user of users) {
      map[user.telegramId] = user;
    }
    return map;
  }, [users]);

  const perUserSeries = useMemo(() => {
    if (!isAdmin) return [];

    const grouped = {};

    for (const item of productions) {
      const id = item.telegramId;

      if (!grouped[id]) {
        grouped[id] = [];
      }

      grouped[id].push(item);
    }

    return Object.entries(grouped)
      .map(([id, items]) => {
        const series = buildDailySeries(items);
        const cups = series.reduce((sum, row) => sum + row.cups, 0);
        const earned = series.reduce((sum, row) => sum + row.earned, 0);

        return {
          id,
          series,
          cups,
          earned,
          name: workerName(usersById[id]),
        };
      })
      .sort((a, b) => b.earned - a.earned);
  }, [isAdmin, productions, usersById]);

  return (
    <div className="analytics-dashboard">
      <h2>Аналітика</h2>

      <div className="analytics-buttons">
        <button onClick={() => setScreen("home")}>← Назад</button>
      </div>

      <hr />

      {productions.length === 0 ? (
        <p className="empty">📊 Ще немає даних для аналітики</p>
      ) : (
        <>
          <div className="analytics-summary">
            <div className="summary-pill">Всього зроблено: <b>{totalCups} шт</b></div>
            <div className="summary-pill">Всього зароблено: <b>{formatMoney(totalEarned)}</b></div>
            {isAdmin && (
              <div className="summary-pill">
                Активних працівників: <b>{perUserSeries.length}</b>
              </div>
            )}
          </div>

          <DailyChart
            title={isAdmin ? "Загальна аналітика по днях" : "Ваша аналітика по днях"}
            series={personalSeries}
          />

          {isAdmin && (
            <div className="users-analytics">
              <h3>По кожному працівнику</h3>

              {perUserSeries.map((worker) => (
                <div className="user-chart-card" key={worker.id}>
                  <div className="user-chart-header">
                    <span className="user-name">{worker.name}</span>
                    <span className="user-stats">
                      {worker.cups} шт · {formatMoney(worker.earned)}
                    </span>
                  </div>

                  <DailyChart title="Динаміка по днях" series={worker.series} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AnalyticsDashboard;
