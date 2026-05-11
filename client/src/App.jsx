import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import SearchResult from './pages/SearchResult';
import WordDetail from './pages/WordDetail';
import Wordbook from './pages/Wordbook';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<SearchResult />} />
            <Route path="/word/:id" element={<WordDetail />} />
            <Route path="/wordbook" element={<Wordbook />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
