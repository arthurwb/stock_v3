import React, { useState, useEffect } from "react";
import Loading from "./Loading.tsx";
import { interpretCommand } from "../utility/commandInterpreter.tsx";
import utilityCommands from "../utility/commands/utilityCommands.tsx";

interface TerminalInputProps {
  onCommandOutput: (output: React.ReactNode) => void;
  clearOutputs: () => void;  // New prop for clearing the terminal
}

export default function TerminalInput({ onCommandOutput, clearOutputs }: TerminalInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isBarVisible, setIsBarVisible] = useState(true);
  const [caretPosition, setCaretPosition] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (caretPosition === 0) {
        setIsBarVisible((prev) => !prev);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [caretPosition]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setCaretPosition(0);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleSubmit();
    } else if (e.key === "ArrowLeft") {
      setCaretPosition((prev) => Math.max(prev - 1, -inputValue.length));
    } else if (e.key === "ArrowRight") {
      setCaretPosition((prev) => Math.min(prev + 1, 0));
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    const [command] = inputValue.trim().split(" ");
    if (command in utilityCommands) {
      const output = utilityCommands[command](clearOutputs); // Pass clearOutputs

      if (command !== "clear") { // Prevent "clear" from outputting anything
        onCommandOutput(
          <div>
            <p className="text-green-400">SampleUser$-: {inputValue}</p>
            <div>{output}</div>
          </div>
        );
      }
    } else {
      const commandOutput = await interpretCommand(inputValue, clearOutputs);
      onCommandOutput(
        <div>
          <p className="text-green-400">SampleUser$-: {inputValue}</p>
          <div>{commandOutput}</div>
        </div>
      );
    }

    setInputValue("");
    setCaretPosition(0);
    setLoading(false);
  };

  return (
    <div className="basis-1/12 flex items-center border-1 border-solid">
      <div className="flex flex-row items-center h-full w-full text-white text-2xl">
        <span className="px-2 text-orange">SampleUser$-:</span>
        <div className="flex-1 h-full flex items-center relative">
          <input
            type="text"
            id="userInput"
            className={`absolute left-0 top-0 w-full h-full bg-transparent focus:outline-none ${
              caretPosition === 0 ? "caret-transparent" : "caret-white"
            }`}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoFocus
          />
          <span className="whitespace-pre-wrap">{inputValue}</span>
          {isBarVisible && caretPosition === 0 && (
            <span className="blinking-bar bg-white w-[8px] h-[24px]" />
          )}
        </div>
      </div>
      {loading && <Loading label="Loading..." />}
    </div>
  );
}
