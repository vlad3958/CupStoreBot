import { useState } from "react";
import { addProduction } from "../../services/api.js";
import "./AddProduction.css";

function AddProduction({
  tg,
  setScreen,
  showError,
  setLoading,
}) {

  const [cupsCount, setCupsCount] = useState("");
  const [cupSize, setCupSize] = useState("");
  const [cupType, setCupType] = useState("");

  const saveProduction = async () => {

    if (!tg) {
      alert("Telegram не ініціалізовано");
      return;
    }

    if (!cupsCount || Number(cupsCount) <= 0) {
      alert("Введіть кількість стаканів");
      return;
    }

    if (!cupSize.trim()) {
      alert("Введіть розмір");
      return;
    }

    if (!cupType) {
      alert("Оберіть тип");
      return;
    }

    try {

      setLoading(true);

      const data = await addProduction(
        tg.initData,
        Number(cupsCount),
        cupSize,
        cupType
      );

      alert(data.message || "Продукцію успішно додано");

      setScreen("production");

    } catch (response) {

      await showError(response);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="add-production">

      <h2>Додати продукцію</h2>

      <input
        type="number"
        placeholder="Кількість стаканів"
        value={cupsCount}
        onChange={(e) => setCupsCount(e.target.value)}
      />

      <input
        type="text"
        placeholder="Розмір стакану"
        value={cupSize}
        onChange={(e) => setCupSize(e.target.value)}
      />

      <select
        value={cupType}
        onChange={(e) => setCupType(e.target.value)}
      >
        <option value="">Оберіть тип стакану</option>
        <option value="single">Одношаровий</option>
        <option value="double">Двошаровий</option>
      </select>

      <div className="buttons">
  <button onClick={saveProduction}>
    ✅ Зберегти
  </button>

  <button onClick={() => setScreen("production")}>
    ← Скасувати
  </button>
</div>

    </div>

  );

}

export default AddProduction;