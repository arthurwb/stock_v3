import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Loading from "./Loading.tsx";
import { interpretCommand } from "../utility/commandInterpreter.tsx";
import utilityCommands from "../utility/commands/utilityCommands.tsx";

import { UserData } from "../types/UserData.tsx";
import { CommandResponse } from "../types/CommandResponse.tsx";
import Warning from "./Warning.tsx";

interface TerminalInputProps {
  onCommandOutput: (output: React.ReactNode) => void;
  clearOutputs: () => void;
  userData: UserData | null
}

export interface TerminalInputHandle {
  focus: () => void;
}

const TerminalInput = forwardRef<TerminalInputHandle, TerminalInputProps>(
  ({ onCommandOutput, clearOutputs, userData }, ref) => {
    const [inputValue, setInputValue] = useState("");
    const [isBarVisible, setIsBarVisible] = useState(true);
    const [caretPosition, setCaretPosition] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [warningContent, setWarningContent] = useState<React.ReactNode>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Expose focus method to parent component
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      }
    }));

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

    const renderUserData = () => {
      if (loading && !userData) {
        return <div>Loading user data...</div>;
      }
  
      if (!userData) {
        return "anonymous";
      }
     
      return userData.username;
    };

    const handleSubmit = async () => {
      if (!inputValue.trim()) return;
      setLoading(true);
      const [command] = inputValue.trim().split(" ");
      if (command in utilityCommands) {
        const output = await utilityCommands[command](clearOutputs);
        console.log(await output.content);
        if (command !== "clear") {
          if (output.type === "output") {
            onCommandOutput(
              <div>
                <p className="text-green-400">{renderUserData()}$-: {inputValue}</p>
                <div>{[output.content]}</div>
              </div>
            );
          } else if (output.type === "warning") {
            setWarningMessage(output.message);
            setWarningContent(output.content);
            setShowWarning(true);
          }
        }
      } else {
        const commandOutput = await interpretCommand(inputValue, clearOutputs);
        console.log(commandOutput);
        onCommandOutput(
          <div>
            <p className="text-green-400">{renderUserData()}$-: {inputValue}</p>
            <div>{commandOutput!.content}</div>
          </div>
        );
      }
      setInputValue("");
      setCaretPosition(0);
      setLoading(false);
    };

    return (
      <div className="basis-1/12 flex items-center border-1 border-solid">
        {showWarning && warningMessage && (
            <Warning
              message={warningMessage}
              onClose={() => {
                setShowWarning(false);
                setWarningMessage(null);
                setWarningContent(null);
              }}
            >
              {warningContent}
            </Warning>
          )}
        <div className="flex flex-row items-center h-full w-full text-white lg:text-2xl md:text-sm overflow-x-auto">
          <span className="px-2 text-orange">{renderUserData()}$-:</span>
          <div className="flex-1 h-12 flex items-center relative">
            <input
              ref={inputRef}
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
            <span className="whitespace-pre-wrap text-transparent">
              {inputValue}
            </span>
            {isBarVisible && caretPosition === 0 && (
              <span className="blinking-bar bg-white w-[8px] h-[24px]" />
            )}
          </div>
        </div>
        {loading && <Loading label="Loading..." />}
      </div>
    );
  }
);

export default TerminalInput;