import React from "react";

import sendCommandToDatabase from './util.ts'
import OptionChart from "../../components/OptionChart.tsx";

const optionCommands = {
    getOptions: async () => {
        const response = await fetch('http://localhost:8080/command', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log( await response)
        const data = await response.json();
        console.log(data)
        return data
    },
    getOption: async (option) => {
        return (
            <OptionChart option={option}></OptionChart>
        )
    }
}

export default optionCommands;