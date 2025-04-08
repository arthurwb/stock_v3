import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import BorderedSection from "./components/BorderedSection.tsx";
import TerminalInput, { TerminalInputHandle } from "./components/TerminalInput.tsx";
import TerminalOutput from "./components/TerminalOutput.tsx";

// Define a type for your user data
interface UserData {
  username: string;
  email: string;
  wallet: string;
  otherData?: string;
  // Add other fields as needed
}

function App() {
  const [commandOutputs, setCommandOutputs] = useState<React.ReactNode[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const terminalInputRef = useRef<TerminalInputHandle>(null);

  // Function to fetch user data from the server
  const fetchUserData = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
      console.log(process.env.REACT_APP_API_URL)
      const response = await fetch(`${apiUrl}/user-data`, {
        method: 'GET',
        credentials: 'include', // Important for including session cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(response)

      // KEY FIX: Reset userData to null if user is not authenticated
      if (response.status === 401 || response.status === 404) {
        setUserData(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      console.log(`data: ${data}`)
      
      // If user is not present, set userData to null
      if (!data.userPresent) {
        setUserData(null);
        return;
      }

      setUserData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
      // Also reset user data in case of errors
      setUserData(null);
    } finally {
      // Always set loading to false after fetch completes
      setLoading(false);
    }
  };

  // Function to handle the output from TerminalInput
  const handleCommandOutput = (output: React.ReactNode) => {
    setCommandOutputs((prevOutputs) => [...prevOutputs, output]);
   
    // Refresh user data after each command
    fetchUserData();
  };

  // Function to clear outputs
  const clearOutputs = () => {
    setCommandOutputs([]);
  };

  // Function to focus the terminal input
  const focusTerminalInput = () => {
    terminalInputRef.current?.focus();
  };

  // Initial data fetch when component mounts
  useEffect(() => {
    setLoading(true);
    fetchUserData();
   
    // Optional: Set up polling to refresh data periodically
    const intervalId = setInterval(() => {
      fetchUserData();
    }, 5000); // Refresh every 5 seconds
   
    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  // Render user data
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
        <div className="flex flex-row basis-2/12 p-2">
          <div className="basis-5/12 m-2">
            <p>--help: show commands</p>
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
          onClick={focusTerminalInput} // Add click handler here
        >
          {/* Terminal Content (Outputs + Input) */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            <TerminalOutput outputs={commandOutputs} />
            <TerminalInput 
              ref={terminalInputRef}
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