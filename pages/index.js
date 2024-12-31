import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!input.trim()) {
      alert('Veuillez entrer un message valide.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Une erreur est survenue.';
        console.error('Server error:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: 'user', content: input },
        { role: 'assistant', content: data.message },
      ]);
      setInput('');
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Impossible de se connecter au serveur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-[Poppins] relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url('/background-image.jpg')`,
        }}
      ></div>

      {/* Chat Container */}
      <div className="flex flex-col items-center justify-center h-screen relative z-10">
        <div className="w-[800px] h-[600px] backdrop-blur-lg bg-gray-800/90 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-6 tracking-widest uppercase text-yellow-300">
            Gardienne des Secrets
          </h1>

          {/* Chat Messages */}
          <div className="h-[450px] overflow-y-auto mb-4 p-4 border border-gray-700 rounded-lg bg-black/50 shadow-inner">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-4 p-3 rounded ${
                  msg.role === 'user'
                    ? 'bg-blue-700 text-white text-right'
                    : 'bg-gray-700 text-left'
                }`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 mb-2 text-center">
              {error}
            </div>
          )}

          {/* Input Field */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-3 border rounded bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Entrez vos pensées..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-6 py-3 rounded ${
                isLoading || !input.trim()
                  ? 'bg-gray-600'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-black'
              }`}
            >
              {isLoading ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>

      {/* Decorative Sidebar */}
      <div className="absolute top-1/4 right-10 w-[250px] p-4 bg-gray-800/80 border border-yellow-500 rounded-lg shadow-lg text-yellow-300">
        <h2 className="text-xl font-semibold mb-4 tracking-widest text-center">
          Les Symboles
        </h2>
        <ul className="list-disc list-inside text-sm space-y-2">
          <li>⚔️ Les chaînes : Protection ou emprisonnement ?</li>
          <li>🕊️ L'hirondelle : Victime ou survivante ?</li>
          <li>💔 Les plaies : Fierté ou douleur ?</li>
        </ul>
        <p className="mt-4 text-xs text-gray-400 text-center">
          Explorez ces idées pour percer le mystère.
        </p>
      </div>
    </div>
  );
}
