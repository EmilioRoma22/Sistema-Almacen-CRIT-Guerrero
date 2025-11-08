export interface TokenPayload {
    exp: number;
    id_departamento: string | number;
    id_usuario: number
}

export interface DatosLogin {
    id_departamento: number;
    correo_usuario: string;
    contraseña_usuario: string;
};