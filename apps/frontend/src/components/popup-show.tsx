import { CheckCircle, CircleX } from "lucide-react"
import { useEffect, useState } from "react"


type PopupShowComponentProps = {
    message: string,
    isError?: boolean,
}

export default function PopupShowComponent({ message, isError = false }: PopupShowComponentProps) {
    const [showPopup, setShowPopup] = useState<boolean>(false)

    useEffect(() => {
        if (message.length > 0) setShowPopup(true)
        else setShowPopup(false)
    }, [message])

    return (
        <>
            {showPopup && (
                <div className="fixed top-4 right-4 z-500 animate-in slide-in-from-top-5 duration-300">
                    <div className="bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3 min-w-[320px] border-2">
                        {!isError ?
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            :
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-red-500 rounded-full flex items-center justify-center">
                                <CircleX className="w-6 h-6 text-white" />
                            </div>
                        }
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{!isError ? 'Sucesso!' : 'Error'}</h3>
                            <p className="text-sm text-gray-600">{message}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}