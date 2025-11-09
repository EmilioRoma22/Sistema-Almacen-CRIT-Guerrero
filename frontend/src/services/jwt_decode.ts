import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "./interfaces";

export const decodeJWT = (token: string): TokenPayload | null => {
    try {
        if (!token) return null;
        const decoded = jwtDecode<TokenPayload>(token)

        return decoded;
    } catch (error) {
        console.error("Error al decodificar el JWT:", error);
        return null;
    }
}