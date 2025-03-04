import React from "react";

import sendCommandToDatabase from './util.ts'
import OptionChart from "../../components/OptionChart.tsx";

const optionCommands = {
    getOptions: () => {
        return(
            <h1>
                GET OPTIONS
            </h1>
        )
    },
    getOption: async (option) => {
        return (
            <OptionChart option={option}></OptionChart>
        )
    }
}

export default optionCommands;