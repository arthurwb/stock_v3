import React from "react";

import Warning from "../../components/Warning.tsx";

type UtilityCommandResponse = React.ReactNode | null;

const utilityCommands = {
    clear: (clearOutputs: () => void): UtilityCommandResponse => {
        clearOutputs(); // Clears the terminal
        return null;
    },
    help: () => {
        return (
            <div className="p-6 max-w-3xl mx-auto font-mono bg-black text-green-400 rounded-md shadow-lg">
                {/* Utility Commands Section */}
                <div className="mb-6">
                    <h1 className="text-red-500 font-bold mb-2">Utility Commands</h1>
                    <div className="ml-4 space-y-1">
                        <pre>clear............................clear terminal</pre>
                        <pre>help.............................show list of commands</pre>
                        <pre>dog..............................dog</pre>
                    </div>
                </div>

                {/* Option Commands Section */}
                <div className="mb-6">
                    <h1 className="text-red-500 font-bold mb-2">Option Commands</h1>
                    <div className="ml-4 space-y-1">
                        <pre>get option [option name].........show details on given option</pre>
                        <pre>get options......................displays all available options and their current price</pre>
                    </div>
                </div>

                <div className="mb-6">
                    <h1 className="text-red-500 font-bold mb-2">User Commands</h1>
                    <div className="ml-4 space-y-1">
                        <pre>login [username] [password]......login with provided credentials</pre>
                    </div>
                </div>
            </div>
        );
    },
    dog: async (): Promise<UtilityCommandResponse> => {
        try {
            const response = await fetch('http://localhost:8080/dog', {
                credentials: "include",
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const dogURL: string = data.message;

            console.log(dogURL)

            return (
                <Warning message={"dog"}>
                    {/* <Image src={dogURL} alt="Random Dog" width={500} height={500} style={{ width: 'auto', height: 350 }}/> */}
                    <img src={dogURL} alt="Random Dog"></img>
                </Warning>
            );
        } catch (error) {
            console.error('Fetch error:', error);
            return <Warning message={`Error fetching dog image: ${error instanceof Error ? error.message : 'Unknown error'}`}></Warning>;
        }
    }
};

export default utilityCommands;