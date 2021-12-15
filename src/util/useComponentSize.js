import { useState, useEffect } from 'react';

export default function useComponentSize(ref) {
  const [size, setSize] = useState([]);

  useEffect(() => {
    function handleResize() {
      setSize([ref.current.offsetWidth, ref.current.offsetHeight])
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [ref]);

  return {width: size[0], height: size[1]};
};
