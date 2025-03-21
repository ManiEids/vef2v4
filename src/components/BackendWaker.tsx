'use client';

import { useEffect, useState } from 'react';

export function BackendWaker() {
  const [status, setStatus] = useState<'idle' | 'pinging' | 'success' | 'error'>('idle');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  useEffect(() => {
    async function wakeUpBackend() {
      const useProxy = process.env.NODE_ENV === 'production';
      const endpointUrl = useProxy 
        ? '/api/proxy?path=/categories' 
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`;
      
      console.log(`BackendWaker: Pinging ${useProxy ? 'via proxy' : 'direct'} at ${endpointUrl}`);
      
      try {
        setStatus('pinging');
        console.log('Pinging backend to wake it up...'); // Pinga
        
        const start = Date.now();
        const response = await fetch(endpointUrl, { cache: "no-store" });
        const elapsed = Date.now() - start;
        
        console.log(`Backend responded in ${elapsed}ms with status ${response.status}`);
        if (response.ok) {
          setStatus('success');
          setErrorDetails(null);
        } else {
          setStatus('error');
          setErrorDetails(`Server responded with status ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to wake up backend:', error); // Villa
        setStatus('error');
        
        // finna ef CORS villur
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          setErrorDetails('Mistókts , athuga CORS villur og hvort REACT sé live.'); 
        } else {
          setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    }
    
    wakeUpBackend();
  }, []);
  
  if (status === 'idle' || status === 'success') return null;
  
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-md z-10 ${
      status === 'pinging' ? 'bg-yellow-100' : 'bg-red-100'
    }`}>
      {status === 'pinging' ? (
        <p className="text-yellow-800 flex items-center">
          <span className="mr-2">Connecting to backend...</span> // Tengist
          <span className="animate-pulse">⏳</span>
        </p>
      ) : (
        <div className="text-red-800">
          <p className="font-bold mb-1">Backend connection failed</p> // Villa
          {errorDetails && <p className="text-sm">{errorDetails}</p>}
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry connection
          </button>
        </div>
      )}
    </div>
  );
}
