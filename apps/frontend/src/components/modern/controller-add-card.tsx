'use client';

export default function ControllerAddCard({ onClick }: { onClick: () => void }) {
    return (
        <div
            className={`w-[200px] h-[200px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 bg-gray-100 hover:bg-gray-200 flex items-center justify-center`}
            onClick={onClick}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center">
                    <svg
                        className="w-12 h-12 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </div>
                <div className="text-center">
                    <span className="text-sm font-medium text-gray-600">Adicionar Controlador</span>
                </div>
            </div>
        </div>
    );
} 