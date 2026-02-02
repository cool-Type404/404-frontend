import './App.css';
import KakaoMap from './components/KakaoMap';

function App() {
  return (
    <div className="app">
      <h1 className="title">혼밥지도</h1>

      <div className="mapWrap">
        <KakaoMap />
      </div>
    </div>
  );
}

export default App;
