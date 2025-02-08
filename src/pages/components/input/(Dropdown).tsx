import { useEffect, useState } from "react";
import { TextInput } from "./(Text)";

interface DropdownProps {
    options: DropDownOptions[];
    selected?: string;
    selectedCallback?: (s: string) => void;
    width?: string;
    height?: string;
    style?: any;
    bindValue?: ()=>string | undefined;
}

export type DropDownOptions = {
    name: string;
    value: string;
}

export const DropdownSelect = ({
    options,
    selected="",
    selectedCallback=(e)=>{console.log(e)},
    width="15em",
    height="auto",
    style={},
    bindValue=()=>undefined,
}: DropdownProps) => {
    // if selected is not in options, don't set it as selected
    const [sel, setSelected] = useState(selected);

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelected(e.target.value);
        selectedCallback(e.target.value);
    };

    useEffect(() => {
        setSelected(bindValue() ?? sel);
    },[bindValue()]);

    return (
        <select
            className="bg-gray-200 text-gray-700 py-2 px-2 rounded"
            // value={sel}
            value={sel}
            onChange={handleSelect}
            style={{width: width, height: height, ...style}}
        >
            {options.map((option, i) => (
                <option key={i} value={option.value}>{option.name}</option>
            ))}
        </select>
    );
}

interface SearchableDropdownProps {
    options: DropDownOptions[];
    selected?: string;
    selectedCallback?: (s: string) => void;
    inputChangeCallback?: (s: string) => void;
    width?: string;
    height?: string;
    dropdownStyle?: any;
    inputStyle?: any;
}
export const SearchableDropdownSelect = ({
    options,
    inputChangeCallback=(q)=>{},
    selectedCallback=(e)=>{console.log(e)},
    width="15em",
    height="auto",
    dropdownStyle={},
    inputStyle={},
} : SearchableDropdownProps) => {
    const [q, setQ] = useState("");
    const dStyle = {
        borderTopLeftRadius:"0px", borderTopRightRadius: "0px",
        backgroundColor: "#4a6283", color:"white",
        ...dropdownStyle
    };
    const iStyle = {borderBottomLeftRadius:"0px",borderBottomRightRadius: "0px", ...inputStyle};

    const modifiedInputChangeCallback = (q: string) => {
        const qLower = q.toLowerCase();
        const optionsLower = options.map((o)=>o.name.toLowerCase());
        for (let i = 0; i < optionsLower.length; i++) {
            console.log(optionsLower[i], qLower);
            if (optionsLower[i].includes(qLower)) {
                setQ(options[i].value);
                selectedCallback(options[i].value);
                break;
            }
        }
    }

    return (
        <div className="inline-flex flex-col">
            <TextInput 
                width={width}
                height={height}
                style={iStyle}
                inputChangeCallback={(q)=>{inputChangeCallback(q); modifiedInputChangeCallback(q)}}
            />
            <DropdownSelect 
                options={options} 
                selectedCallback={selectedCallback}
                width={width}
                height={height}
                style={dStyle}
                bindValue={()=>q}
            />
        </div>
    )
}