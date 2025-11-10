export interface TokenPayload {
    exp: number;
    id_departamento: string | number;
    nombre_departamento: string
    id_usuario: number,
    nombre_usuario: string,
    apellidos_usuario: string,
    correo_usuario: string
}

export interface DatosLogin {
    correo_usuario: string;
    password_usuario: string;
};

export interface Usuario {
    id_usuario: number,
    nombre_usuario: string,
    apellidos_usuario: string,
    correo_usuario: string,
    id_departamento: number,
    nombre_departamento: string
}