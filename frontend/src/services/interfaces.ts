export interface TokenPayload {
    exp: number;
    id_departamento: string | number;
    nombre_departamento: string
    id_usuario: number
}

export interface DatosLogin {
    correo_usuario: string;
    password_usuario: string;
};