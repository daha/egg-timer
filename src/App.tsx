import './App.css';
import { useEggTimer } from './hooks/useEggTimer';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const { state, restoreEggs } = useEggTimer();

  // Integrate localStorage persistence
  useLocalStorage({
    eggs: state.eggs,
    status: state.status,
    restoreEggs,
  });

  return (
    <>
      <div className="app">
        <header>
          <h1>🥚 Egg Timer</h1>
          <p>Perfect eggs every time</p>
        </header>
        <main>
          <p>Application is being built...</p>
          <p>LocalStorage integration: Active</p>
          <p>Eggs in state: {state.eggs.length}</p>
        </main>
      </div>
    </>
  );
}

export default App;
