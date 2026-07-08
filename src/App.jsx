import { useEffect, useState } from "react";
import { login as loginApi} from "./services/api";
import Home from "./components/Home/Home";
import ProductionList from "./components/ProductionList/ProductionList";
import AddProduction from "./components/AddProduction/AddProduction";
import Loader from "./components/Loader/Loader";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import { dateKey } from "./date.js";
import "./App.css";

function App() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => dateKey(new Date()));
  const [loading, setLoading] = useState(false);

  const showError = async (response) => {
    try {
      const data = await response.json();

      alert(
        `Помилка\n\n` +
          `Статус: ${response.status}\n` +
          `${data.message || "Невідома помилка"}`
      );
    } catch {
      alert("Помилка сервера");
    }
  };

  useEffect(() => {
    const login = async () => {
      if (!window.Telegram?.WebApp) {
        alert("Відкрий застосунок через Telegram");
        return;
      }

      const telegram = window.Telegram.WebApp;

      telegram.ready();

      setTg(telegram);

     
    try {

      setLoading(true);

      const data = await loginApi(telegram.initData);

      setUser(data.user);
      setIsAdmin(!!data.isAdmin);


      console.log(data.user);
      console.log(data);

    } catch (error) {

      await showError(error);

    } finally {

      setLoading(false);

    }
};

    login();
  }, []);

  return (
    <div className="App">

      {loading && <Loader />}

      {screen === "home" && (
        <Home
          user={user}
          setScreen={setScreen}
          tg={tg}
          isAdmin={isAdmin}
         />
      )}

      {screen === "production" && (
        <ProductionList
          screen={screen}
          tg={tg}
          setScreen={setScreen}
          showError={showError}
          setLoading={setLoading}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      )}

      {screen === "add" && (
        <AddProduction
          tg={tg}
          setScreen={setScreen}
          showError={showError}
          setLoading={setLoading}
          selectedDay={selectedDay}
        />
      )}

      {screen === "admin" && (
        <AdminDashboard
          tg={tg}
          setScreen={setScreen}
          showError={showError}
          setLoading={setLoading}
        />
      )}

    </div>
  );
}

export default App;