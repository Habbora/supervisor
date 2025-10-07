
const border = "border border-gray-300 rounded-md p-2 w-full"

interface InputSelectProps {
    id: string;
    label: string;
    value: string;
    options: {
        name: string;
        value: string;
    }[];
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function InputSelect({ id, label, value, options, onChange, disabled }: InputSelectProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id}>{label}</label>
            <div className="flex flex-row gap-2 items-center justify-between">
                <select
                    id={id}
                    name={id}
                    className={border}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
