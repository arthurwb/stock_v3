import React from "react";
import parse from "html-react-parser";

import sendCommandToDatabase from './util.ts'
import OptionChart from "../../components/OptionChart.tsx";

const optionCommands = {
    getOptions: async () => {
        const res = await sendCommandToDatabase("get options");
        return (<>{parse(res.message)}</>);
    },
    getOption: async (option) => {
        return (
            <OptionChart option={option}></OptionChart>
        )
    },
    buyOption: async (option) => {
        const res = await sendCommandToDatabase(`buy option ${option}`);
        console.log(res);
        return res;
    },
    sellOption: async (option) => {
        const res = await sendCommandToDatabase(`sell option ${option}`);
        return res
    },
    myOptions: async () => {
        const res = await sendCommandToDatabase("my options");
        return (<>{parse(res.message)}</>);
    }
}

export default optionCommands;