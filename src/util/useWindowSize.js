import { useState, useEffect } from 'react';

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState();
  
  useEffect(() => {
    const handleResize = () => setWindowSize({
      width: window.width,
      height: window.height
    });

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [])

  return windowSize;
}
