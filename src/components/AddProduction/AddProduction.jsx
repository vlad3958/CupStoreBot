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
      alert("Telegram не инициализирован");
      return;
    }

    if (!cupsCount || Number(cupsCount) <= 0) {
      alert("Введите количество стаканов");
      return;
    }

    if (!cupSize.trim()) {
      alert("Введите размер стакана");
      return;
    }

    if (!cupType.trim()) {
      alert("Введите тип стакана");
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

      alert(data.message || "Продукция успешно добавлена");

      setScreen("production");

    } catch (response) {

      await showError(response);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="add-production">

      <h2>Добавить продукцию</h2>

      <input
        type="number"
        placeholder="Количество стаканов"
        value={cupsCount}
        onChange={(e) => setCupsCount(e.target.value)}
      />

      <input
        type="text"
        placeholder="Размер стакана"
        value={cupSize}
        onChange={(e) => setCupSize(e.target.value)}
      />

      <input
        type="text"
        placeholder="Тип стакана"
        value={cupType}
        onChange={(e) => setCupType(e.target.value)}
      />

      <div className="buttons">
  <button onClick={saveProduction}>
    ✅ Сохранить
  </button>

  <button onClick={() => setScreen("production")}>
    ← Отмена
  </button>
</div>

    </div>

  );

}

export default AddProduction;