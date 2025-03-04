import React, { useEffect, useState, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

import sendCommandToDatabase from '../utility/commands/util.ts'

interface HistoricalPrice {
    price: number;
    timestamp: string;
}

interface OptionData {
    optionName: string;
    optionPrice: string;
}

interface DatabaseResponse {
    message?: {
        option?: OptionData;
        historicalPrices?: { historicalPrice: string; historicalPriceStamp: string }[];
    };
}

const OptionChart: React.FC<{ option: string }> = ({ option }) => {
    const [optionData, setOptionData] = useState<OptionData | null>(null);
    const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrice[]>([]);
    const [error, setError] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null); // Reference to the container

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data: DatabaseResponse = await sendCommandToDatabase(`get option ${option}`);

                if (!data.message || !data.message.option) {
                    setError(`Error: Option "${option}" not found.`);
                    setOptionData(null);
                    setHistoricalPrices([]);
                    return;
                }

                const optionInfo = data.message.option;
                const sortedPrices = (data.message.historicalPrices || [])
                    .map(d => ({
                        price: parseFloat(d.historicalPrice),
                        timestamp: new Date(d.historicalPriceStamp).toLocaleString()
                    }))
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                setOptionData(optionInfo);
                setHistoricalPrices(sortedPrices);
                setError(null); // Clear any previous errors
            } catch (err) {
                setError("Error fetching option data.");
                setOptionData(null);
                setHistoricalPrices([]);
            }
        };

        fetchData();
    }, [option]);

    // Scroll to the bottom when new content is fully rendered
    useEffect(() => {
        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }, 50); // Delay allows the DOM to update first
    }, [optionData, historicalPrices, error]);

    return (
        <div ref={containerRef} className="overflow-y-auto max-h-[500px] p-4">
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                optionData && (
                    <div>
                        <h2>{optionData.optionName}</h2>
                        <p>Current Price: ${optionData.optionPrice}</p>

                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={historicalPrices}>
                                <XAxis dataKey="timestamp" hide={true} />
                                <YAxis />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )
            )}
        </div>
    );
};

export default OptionChart;
