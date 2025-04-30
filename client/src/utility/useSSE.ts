import { useEffect, useState } from 'react';

type sseData = {
    'data': string
}

function useSSE(url: string, setShowWarning: React.Dispatch<React.SetStateAction<boolean>>) {
    const [data, setData] = useState<null | sseData>(null);
    const [sseError, setsseError] = useState<null | string>(null);

    useEffect(() => {
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            const newData = JSON.parse(event.data);
            setShowWarning(true);
            setData(newData);
        };

        eventSource.onerror = () => {
            setsseError('Connection lost. Trying to reconnect...');
            eventSource.close();
        }

        return () => eventSource.close();
    }, [url]);

    return { data, sseError };
}

export default useSSE;