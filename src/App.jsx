import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const [tg, setTg] = useState(null);

  const [cupsCount, setCupsCount] = useState("");
  const [cupSize, setCupSize] = useState("");
  const [cupType, setCupType] = useState("");

 const showError = async (response) => {
    try {
      const data = await response.json();

      alert(
        `Ошибка!\n\n` +
        `Статус: ${response.status}\n` +
        `Сообщение: ${data.message || "Нет сообщения"}`
      );

      console.error(data);
    } catch {
      alert(
        `Ошибка!\n\n` +
        `Статус: ${response.status}\n` +
        `Не удалось прочитать ответ сервера`
      );
    }
  };

  useEffect(() => {

   
   const login = async () => {
  if (!window.Telegram?.WebApp) {
    alert("Приложение открыто не в Telegram");
    return;
  }

  const telegram = window.Telegram.WebApp;

  telegram.ready();

  setTg(telegram);

  console.log("Данные пользователя:", telegram.initDataUnsafe);

  try {
    const response = await fetch("https://cupstoreserver.onrender.com/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initData: telegram.initData,
      }),
    });

    if (!response.ok) {
      await showError(response);
      return;
    }

    const data = await response.json();

    console.log(data);

    alert("Авторизация успешна!");
  } catch (error) {
    alert(error instanceof Error ? error.message : "Неизвестная ошибка");
    console.error(error);
  }
};
login();
  }, []);

  const saveProduction = async () => {

    if (!tg) return;

    try {
   const response = await fetch("https://cupstoreserver.onrender.com/api/production", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initData: tg.initData,
        cupsCount: Number(cupsCount),
        cupSize,
        cupType,
        date: new Date(),
      }),
    });

   if (!response.ok) {
    await showError(response);
    return;
    }

  const data = await response.json();

  alert(data.message || "Данные успешно сохранены");
    } catch (error) {
  alert(error instanceof Error ? error.message : "Неизвестная ошибка");
  console.error(error);
}
  };

  return (
    <div className="App">

      <h1>Factory Mini App</h1>

      <input
        type="number"
        placeholder="Количество стаканов"
        value={cupsCount}
        onChange={(e) => setCupsCount(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Размер стакана"
        value={cupSize}
        onChange={(e) => setCupSize(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Тип стакана"
        value={cupType}
        onChange={(e) => setCupType(e.target.value)}
      />

      <br /><br />

      <button onClick={saveProduction}>
        Сохранить
      </button>

    </div>
  );
}

export default App;