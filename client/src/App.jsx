import { useEffect, useState } from 'react';

// Phase 1 placeholder: proves the client can reach the API through the dev proxy.
export default function App() {
  const [health, setHealth] = useState('checking…');

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setHealth(`${d.status} (database: ${d.database})`))
      .catch(() => setHealth('API unreachable'));
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h1>Daily Sales</h1>
      <p>API status: {health}</p>
    </main>
  );
}
