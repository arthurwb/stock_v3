import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import BorderedSection from "./components/BorderedSection.tsx";
import TerminalInput, { TerminalInputHandle } from "./components/TerminalInput.tsx";
import TerminalOutput from "./components/TerminalOutput.tsx";
import NewsTicker from "./components/Ticker.tsx";

import { UserData } from "./types/UserData.tsx";

import useSSE from "./utility/useSSE.ts";
import Warning from "./components/Warning.tsx";
import { Link } from "react-router-dom";

function App() {
  const [commandOutputs, setCommandOutputs] = useState<React.ReactNode[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const terminalInputRef = useRef<TerminalInputHandle>(null);

  // replace with env url later
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const { data, sseError } = useSSE(`${apiUrl}/events`, setShowWarning)

  // Function to fetch user data from the server
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${apiUrl}/user-data`, {
        method: 'GET',
        credentials: 'include', // Important for including session cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 404) {
        setUserData(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.userPresent) {
        setUserData(null);
        return;
      }

      setUserData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCommandOutput = (output: React.ReactNode) => {
    setCommandOutputs((prevOutputs) => [...prevOutputs, output]);
   
    fetchUserData();
  };

  const clearOutputs = () => {
    setCommandOutputs([]);
  };

  const focusTerminalInput = () => {
    terminalInputRef.current?.focus();
  };

  useEffect(() => {
    setLoading(true);
    fetchUserData();
   
    const intervalId = setInterval(() => {
      fetchUserData();
    }, 5000); // Refresh every 5 seconds
   
  }, []);

  const renderUserData = () => {
    if (loading && !userData) {
      return <div>Loading user data...</div>;
    }
   
    if (error) {
      return <div className="text-red-500">{error}</div>;
    }

    if (!userData) {
      return <div>Not Logged In</div>;
    }
   
    return (
      <div className="flex flex-col space-y-1">
        <div className="font-semibold">{userData.username}</div>
        <div>{userData.email}</div>
        <div>Wallet: {userData.wallet}</div>
      </div>
    );
  };

  return (
    <main>
      <div className="relative flex flex-col px-4 w-screen h-screen bg-black text-white">
        <NewsTicker></NewsTicker>
        <div className="flex flex-row basis-2/12 p-2">
          <div className="basis-5/12 m-2">
            <p>--help: show commands</p>
            <p className="m-1"><Link to="/feed" className="border">link:Feed</Link></p>
            <p className="m-1"><Link to="/changelog" className="border">link:Changelog</Link></p>
            {sseError && <p>{sseError}</p>}
            {showWarning && data ? <Warning message={data.data} onClose={() => setShowWarning(false)}></Warning> : <p>Connected to database...</p>}
          </div>
          <div className="basis-2/12 m-2 text-center">
            <img src="/exchange-logo.svg" className="mx-auto" style={{ width: 100, height: 100 }}></img>
            <span className="font-bold underline">The Exchange</span>
          </div>
          <div className="flex flex-col basis-5/12 m-2">
            <div className="flex flex-col basis-6/12 text-center">
              {renderUserData()}
            </div>
            <div className="basis-6/12"></div>
          </div>
        </div>
        <div 
          className="flex flex-col basis-10/12 px-2 pt-2 border-green border-x-1 border-t-1 border-solid overflow-hidden"
          onClick={focusTerminalInput}
        >
          <div className="flex flex-col flex-1 overflow-y-auto">
            <TerminalOutput outputs={commandOutputs} />
            <TerminalInput 
              ref={terminalInputRef}
              userData={userData} 
              onCommandOutput={handleCommandOutput} 
              clearOutputs={clearOutputs} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
