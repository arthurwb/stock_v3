export default async function sendCommandToDatabase(command: string): Promise<any> {
  try {
    const response = await fetch("http://localhost:8080/command", {
      credentials: "include",  // Ensure credentials (cookies) are included
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
    });

    if (response.status === 500) {
      return `Unknown Command: ${command}`;
    }

    if (response.status === 400) {
      return "No command provided";
    }

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data || "Command executed successfully.";
  } catch (error) {
    console.error("Error sending command:", error);
    return "Error processing command.";
  }
}
