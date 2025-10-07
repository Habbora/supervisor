const border = "border border-gray-300 rounded-md p-2 w-full"

interface InputTextProps {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}

export default function InputText({ id, label, placeholder, value, onChange }: InputTextProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id}>{label}</label>
            <div className="flex flex-row gap-2 items-center justify-between">
                <input
                    type="text"
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