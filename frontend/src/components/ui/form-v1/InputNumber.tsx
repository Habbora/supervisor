const border = "border border-gray-300 rounded-md p-2 w-full"

interface InputNumberProps {
    id: string;
    label: string;
    placeholder: string;
    value: number;
    onChange: (value: string) => void;
}

export default function InputNumber({ id, label, placeholder, value, onChange }: InputNumberProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id}>{label}</label>
            <div className="flex flex-row gap-2 items-center justify-between">
                <input
                    type="number"
                    id={id}
                    name={id}
                    className={border}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}