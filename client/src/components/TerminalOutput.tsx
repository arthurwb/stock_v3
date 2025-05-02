import React, { useEffect, useRef } from "react";

interface TerminalOutputProps {
  outputs: React.ReactNode[];
}

export default function TerminalOutput({ outputs }: TerminalOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [outputs]);  // Trigger when outputs change, including additions and updates

  return (
    <div ref={containerRef} className="flex flex-col space-y-2 overflow-y-scroll no-scrollbar">
      {outputs.map((output, index) => (
        <div key={index} className="whitespace-pre-wrap">
          {output}
        </div>
      ))}
    </div>
  );
}
