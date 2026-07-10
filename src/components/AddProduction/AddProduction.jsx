import { useState } from "react";
import { addProduction } from "../../services/api.js";
import { dateKey, toApiDateDdMmYyyy } from "../../date.js";
import { CUP_SIZES } from "../../constants/cupSizes.js";
import "./AddProduction.css";

function AddProduction({
  tg,
  setScreen,
  showError,
  setLoading,
  selectedDay,
  setSelectedDay,
}) {

  const [cupsCount, setCupsCount] = useState("");
  const [cupSize, setCupSize] = useState("");
  const [cupType, setCupType] = useState("");
  const [date, setDate] = useState(() => selectedDay || dateKey(new Date()));

  const saveProduction = async () => {

    if (!tg) {
      alert("Telegram не ініціалізовано");
      return;
    }

    if (!cupsCount || Number(cupsCount) <= 0) {
      alert("Введіть кількість стаканів");
      return;
    }

    if (!cupSize) {
      alert("Оберіть розмір стакана");
      return;
    }

    if (!cupType) {
      alert("Оберіть тип стакана");
      return;
    }

    if (!date) {
      alert("Оберіть дату");
      return;
    }

    const dateValue = toApiDateDdMmYyyy(date);

    try {

      setLoading(true);

      const data = await addProduction(
        tg.initData,
        Number(cupsCount),
        cupSize,
        cupType,
        dateValue
      );

      alert(data.message || "Продукцію успішно додано");

      setSelectedDay(dateKey(date));
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

      <select
        value={cupSize}
        onChange={(e) => setCupSize(e.target.value)}
      >
        <option value="">Оберіть розмір стакана</option>
        {CUP_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <select
        value={cupType}
        onChange={(e) => setCupType(e.target.value)}
      >
        <option value="">Оберіть тип стакана</option>
        <option value="single">Одношаровий</option>
        <option value="double">Двошаровий</option>
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

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