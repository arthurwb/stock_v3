import React from "react";
import parse from "html-react-parser";

import sendCommandToDatabase from './util.ts'
import OptionChart from "../../components/OptionChart.tsx";

import { CommandResponse } from "../../types/CommandResponse.tsx";

const optionCommands = {
    getOptions: async (): Promise<CommandResponse> => {
        const res = await sendCommandToDatabase("get options");
        return {
            type: "output",
            message: "",
            content: <>{parse(res.message)}</>
        }
    },
    getOption: async (option): Promise<CommandResponse> => {
        return {
            type: "output",
            message: "",
            content: <OptionChart option={option}></OptionChart>
        }
    },
    buyOption: async (option): Promise<CommandResponse> => {
        const res = await sendCommandToDatabase(`buy option ${option}`);
        return {
            type: "output",
            message: "",
            content: <>{parse(res.message)}</>
        };
    },
    sellOption: async (option): Promise<CommandResponse> => {
        const res = await sendCommandToDatabase(`sell option ${option}`);
        return {
            type: "output",
            message: "",
            content: <>{parse(res.message)}</>
        };
    },
    myOptions: async (): Promise<CommandResponse> => {
        const res = await sendCommandToDatabase("my options");
        return {
            type: "output",
            message: "",
            content: <>{parse(res.message)}</>
        };
    }
}

export default optionCommands;
