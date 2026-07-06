import "./Home.css";

function Home({
    user,
    tg,
    setScreen,
}) {
  return (
    <div className="home">

      <h1>Factory Mini App</h1>
      <h2>
          Привет, {user?.first_name} 👋
      </h2>

      <button
        onClick={() => setScreen("production")}
      >
        📦 Продукция
      </button>

    </div>
  );
}

export default Home;