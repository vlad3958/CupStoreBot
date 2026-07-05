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
        return;
      }

      const telegram = window.Telegram.WebApp;

      telegram.ready();

      setTg(telegram);

      console.log(telegram.initDataUnsafe);

      try {

        const response = await fetch("http://localhost:3000/api/login", {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            initData: telegram.initData,
          }),

        });

        const data = await response.json();

        console.log(data);

      } catch (error) {

        console.error(error);

      }

    };

    login();

  }, []);

  const saveProduction = async () => {

    if (!tg) return;

    try {

      const response = await fetch("http://localhost:3000/api/production", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          initData: tg.initData,

          cupsCount: Number(cupsCount),

          cupSize,

          cupType,

          date: new Date()

        }),

      });

      const data = await response.json();

      alert(data.message);

    } catch (err) {

      console.error(err);

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