import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const [tg, setTg] = useState(null);

  const [cupsCount, setCupsCount] = useState("");
  const [cupSize, setCupSize] = useState("");
  const [cupType, setCupType] = useState("");

  useEffect(() => {

    const login = async () => {

      if (!window.Telegram?.WebApp) {
        console.log("Приложение открыто не в Telegram");
       
      }

      const telegram = window.Telegram.WebApp;

      telegram.ready();

      setTg(telegram);

      console.log(telegram.initDataUnsafe);

     const response = await fetch("https://cupstoreserver.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          initData: telegram.initData,
        }),
      });

      const data = await response.json();

      console.group("Ответ сервера");
      console.log("Status:", response.status);
      console.log("StatusText:", response.statusText);
      console.log("Body:", data);
      console.groupEnd();

      if (!response.ok) {
        alert(data.message || "Ошибка авторизации");
        return;
      }

    };

    login();

  }, []);

  const saveProduction = async () => {

   // if (!tg) return;

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

    const data = await response.json();

    console.group("Ответ сервера");
    console.log("Status:", response.status);
    console.log("StatusText:", response.statusText);
    console.log("Body:", data);
    console.groupEnd();

    if (!response.ok) {
      alert(data.message || "Ошибка сохранения");
      return;
    }

    alert(data.message || "Данные успешно сохранены");

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