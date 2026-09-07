import { useShadoiApp } from './hooks/useShadoiApp';
import { APP_CONFIG } from './lib/config';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { Home } from './screens/Home';
import { Library } from './screens/Library';
import { AddMaterial } from './screens/AddMaterial';
import { Practice } from './screens/Practice';
import { Result } from './screens/Result';
import { colors } from './lib/theme';

function App() {
  const app = useShadoiApp(APP_CONFIG);
  const screen = app.state.screen;
  const showTabs = screen === 'home' || screen === 'library';

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
      <Header app={app} />
      {screen === 'home' && <Home app={app} />}
      {screen === 'library' && <Library app={app} />}
      {screen === 'add' && <AddMaterial app={app} />}
      {screen === 'practice' && <Practice app={app} />}
      {screen === 'result' && <Result app={app} />}
      {showTabs && <TabBar app={app} />}
    </div>
  );
}

export default App;
