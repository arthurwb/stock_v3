import React, { useState } from "react";
import "./App.css";

import BorderedSection from "./components/BorderedSection.tsx";
import TerminalInput from "./components/TerminalInput.tsx";
import TerminalOutput from "./components/TerminalOutput.tsx";

function App() {
    const [commandOutputs, setCommandOutputs] = useState<React.ReactNode[]>([]);

    // Function to handle the output from TerminalInput
    const handleCommandOutput = (output: React.ReactNode) => {
        setCommandOutputs((prevOutputs) => [...prevOutputs, output]);
    };

    // Function to clear outputs
    const clearOutputs = () => {
        setCommandOutputs([]);
    };

    return (
        <main>
            <div className="relative flex flex-col px-4 w-screen h-screen bg-black text-white">
                <div className="flex flex-row basis-2/12 p-2">
                    <div className="basis-5/12 m-2">
                        <p>--help: show commands</p>
                    </div>
                    <BorderedSection label="Logo" className="basis-2/12 m-2">
                        image
                    </BorderedSection>
                    <div className="flex flex-col basis-5/12 m-2">
                        <div className="flex flex-col basis-6/12 text-center">
                            Username, Email, Wallet, Other Data...
                        </div>
                        <div className="basis-6/12"></div>
                    </div>
                </div>
                <div className="flex flex-col basis-10/12 px-2 pt-2 border-green border-x-1 border-t-1 border-solid overflow-hidden">
                    {/* Terminal Content (Outputs + Input) */}
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <TerminalOutput outputs={commandOutputs} />
                        <TerminalInput onCommandOutput={handleCommandOutput} clearOutputs={clearOutputs} />
                    </div>
                </div>
            </div>
        </main>
    );
}


export default App;
