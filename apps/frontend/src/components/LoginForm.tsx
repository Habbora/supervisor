"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/features/auth/hooks/useAuth"
import PopupShowComponent from "./popup-show";
import { useState } from "react";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const { login } = useAuth();
    const [popupMessage, setPopopMessage] = useState<string>('');
    const [popupIsError, setPopupIsError] = useState<boolean>(false)
    async function showPopup(message: string, timeout: number = 3000, isError: boolean = false) {
        setPopupIsError(isError)
        setPopopMessage(message)
        setTimeout(() => setPopopMessage(''), timeout)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        await login(username, password).catch((error) => {
            showPopup("Erro ao fazer login. Verifique seu usuário e senha.", 3000, true);
        })
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Supervisor</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="username">Usuário</FieldLabel>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="usuario"
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </Field>
                            <Field>
                                <Button type="submit">Entrar</Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>

            <PopupShowComponent
                message={popupMessage}
                isError={popupIsError}
            />
        </div>
    )
}
