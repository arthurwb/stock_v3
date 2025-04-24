import React, { useEffect, useRef, useState } from "react";
import { HorizontalTicker } from "react-infinite-ticker";

const Ticker = () => {
  const duration = 18000;
  const [currentItems, setCurrentItems] = useState([]);
  const nextItemsRef = useRef([]);
  const isMountedRef = useRef(false);
  const timeoutRef = useRef(null);

  // Fetch data and store in ref
  const fetchAndQueueNext = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
      const res = await fetch(apiUrl + "/news");
      const data = await res.json();
      const newItems = Array.isArray(data) ? data : data.details;
      nextItemsRef.current = newItems;
      return newItems;
    } catch (err) {
      return [];
    }
  };

  const scheduleNextUpdate = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Schedule the next update
    timeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;
      
      // Check if we have different data to display
      if (nextItemsRef.current.length > 0 && 
          JSON.stringify(nextItemsRef.current) !== JSON.stringify(currentItems)) {
        setCurrentItems(nextItemsRef.current);
      }
      
      // Fetch next set in background
      await fetchAndQueueNext();
      
      // And schedule the next update
      if (isMountedRef.current) {
        scheduleNextUpdate();
      }
    }, duration);
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    // First fetch and initialization
    const initialize = async () => {
      const initialItems = await fetchAndQueueNext();
      
      if (!isMountedRef.current) return;
      
      // Show initial data if we got any
      if (initialItems.length > 0) {
        setCurrentItems(initialItems);
      }
      
      // Preload next batch and start the update cycle
      await fetchAndQueueNext();
      scheduleNextUpdate();
    };
    
    initialize();
    
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!currentItems.length) return null;
  
  return (
    <div className="w-full bg-black text-white py-2 overflow-hidden">
      <HorizontalTicker duration={duration} delay={0}>
        {currentItems.map((item, index) => (
          <span
            key={`${index}-${item.substring(0, 10)}`}
            className="mx-8 text-lg uppercase whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </HorizontalTicker>
    </div>
  );
};

export default Ticker;