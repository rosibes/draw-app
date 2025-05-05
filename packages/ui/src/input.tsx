
type InputProps = {
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    reference?: any,
    className?: string,

};

export function Input({
    type, placeholder, value, onChange, label, reference, className
}: InputProps) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            ref={reference}
            value={value}
            onChange={onChange}
            className={` p-3 border rounded ${className}`}
        />
    )
}