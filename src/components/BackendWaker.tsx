'use client';

import { useEffect, useState } from 'react';

export function BackendWaker() {
  const [status, setStatus] = useState<'idle' | 'pinging' | 'success' | 'error'>('idle');
  
  useEffect(() => {
    async function wakeUpBackend() {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      console.log('BackendWaker: API_BASE_URL =', API_BASE_URL);  // Added log
      
      if (!API_BASE_URL) return;
      
      try {
        setStatus('pinging');
        console.log('Pinging backend to wake it up...');
        
        const start = Date.now();
        const response = await fetch(`${API_BASE_URL}/categories`, { cache: "no-store" }); // updated
        const elapsed = Date.now() - start;
        
        console.log(`Backend responded in ${elapsed}ms with status ${response.status}`);
        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Failed to wake up backend:', error);
        setStatus('error');
      }
    }
    
    wakeUpBackend();
  }, []);
  
  if (status === 'idle' || status === 'success') return null;
  
  return (
    <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg ${
      status === 'pinging' ? 'bg-yellow-100' : 'bg-red-100'
    }`}>
      {status === 'pinging' ? (
        <p className="text-yellow-800 flex items-center">
          <span className="mr-2">Connecting to backend...</span>
          <span className="animate-pulse">⏳</span>
        </p>
      ) : (
        <p className="text-red-800">
          Backend connection failed. Please try refreshing the page.
        </p>
      )}
    </div>
  );
}
