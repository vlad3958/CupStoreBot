import { useEffect, useState } from "react";
import { getProductions } from "../../services/api.js";
import "./ProductionList.css";

function ProductionList({
  tg,
  setScreen,
  showError,
  setLoading,
}) {
  const [productions, setProductions] = useState([]);

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
        productions.map((item) => (
          <div className="production-card"
            key={item._id}
          >
            <p>
              <b>Количество:</b> {item.cupsCount}
            </p>

            <p>
              <b>Размер:</b> {item.cupSize}
            </p>

            <p>
              <b>Тип:</b> {item.cupType}
            </p>

            <p>
              <b>Дата:</b>{" "}
              {new Date(item.date).toLocaleString("uk-UA")}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default ProductionList;