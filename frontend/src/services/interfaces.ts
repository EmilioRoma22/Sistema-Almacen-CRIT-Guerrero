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

export interface Entradas {
    id_entrada: number,
    id_producto: number,
    nombre_categoria: string,
    nombre_producto: string,
    unidad: string,
    cantidad: string,
    completada: boolean,
    fecha_entrada: string
    pendiente_mas_3dias: boolean
}

export type Entrada = {
    categoria: Categoria
    productos: Producto[],
    nombre_donador?: string
}

export type Resguardo = {
    categoria: Categoria
    productos: Producto[]
    departamento: number
}

export interface Productos {
    id_producto: number,
    nombre_producto: string,
    unidad: string
}

export type Producto = {
    id?: string
    cantidad: string;
    unidad: string;
    nombre: string;
};