import { useState, useRef, useEffect } from 'react';

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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-4">
        <div className="h-[600px] overflow-y-auto mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-4 p-3 rounded ${
                msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        {error && (
          <div className="text-red-500 mb-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Partagez vos pensées sur l'art..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-4 py-2 rounded ${
              isLoading || !input.trim()
                ? 'bg-gray-400'
                : 'bg-blue-500 text-white'
            }`}
          >
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}
