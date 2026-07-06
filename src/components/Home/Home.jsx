import "./Home.css";

function Home({
    user,
    tg,
    setScreen,
}) {
  return (
    <div className="home">

      <h1>Виробничий застосунок</h1>
      <h2>
          Привіт, {user?.first_name || "Користувач"} 👋
      </h2>

      <button
        onClick={() => setScreen("production")}
      >
        📦 Продукція
      </button>

      <button onClick={() => tg.close()}>
          Закрити застосунок
      </button>
    </div>
  );
}

export default Home;