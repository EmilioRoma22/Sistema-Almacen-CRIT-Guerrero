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

export type DatosUsuario = {
    nombre_usuario: string
    apellidos_usuario: string,
    correo_usuario: string,
    id_departamento: number,
    contraseña_usuario: string,
    confirmar_contraseña: string
}

export type DatosEditarUsuario = {
    nombre_usuario: string
    apellidos_usuario: string
    correo_usuario: string
    new_password: string
    id_departamento: number
    id_usuario: number
}

export interface Departamento {
    id_departamento: number;
    nombre_departamento: string;
    id_responsable: number | null;
    nombre_usuario: string
    apellidos_usuario: string
    cantidad_usuarios: number,
    correo_usuario: string
}

export type DatosEditarDepartamento = {
    id_departamento: number
    nombre_departamento: string,
    id_responsable: number
}

export interface Categoria {
    id_categoria: number,
    nombre_categoria: string
}