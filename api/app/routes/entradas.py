from fastapi import APIRouter, status, Depends, HTTPException
from app.services.pdf_metodos import generar_pdf_entrada
from app.models.modelo_entradas import DataAgregarEntrada
from app.auth.dependencies import verify_access
from app.core.database import get_connection, fetch_all_dict
from datetime import datetime

router = APIRouter(
    prefix="/entradas",
    tags=["Entradas"]
)

@router.get("/obtener_entradas", status_code=status.HTTP_200_OK)
def obtener_entradas(usuario=Depends(verify_access([1, 2]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            SELECT
                e.id_entrada,
                c.nombre_categoria,
                p.id_producto,
                p.nombre_producto,
                p.unidad,
                e.cantidad,
                e.completada,
                e.fecha_entrada,
                CASE
                    WHEN e.id_entrada IS NOT NULL AND CAST(e.fecha_entrada AS DATE) <= CAST(DATEADD(DAY, -3, GETDATE()) AS DATE)
                    THEN 1
                    ELSE 0
                END AS pendiente_mas_3dias
            FROM entradas e
            JOIN categorias c ON e.id_categoria = c.id_categoria
            JOIN productos p ON e.id_producto = p.id_producto
            WHERE e.completada = 0 AND c.activo = 1
            ORDER BY
                pendiente_mas_3dias DESC,
                e.fecha_entrada DESC;
        """)

        entradas = fetch_all_dict(cursor)

        for entrada in entradas:
            fecha = entrada.get("fecha_entrada")
            if isinstance(fecha, datetime):
                entrada["fecha_entrada"] = fecha.strftime("%d/%m/%Y %I:%M %p")
                
        entradas_3_dias = []
        
        for entrada in entradas:
            if entrada["pendiente_mas_3dias"] == 1:
                entradas_3_dias.append(entrada)
                
        return entradas
    except HTTPException as err:
        raise err
    except Exception as err:
        print(f"Error interno: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error interno del servidor"}
        )
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

@router.post("/agregar_entrada", status_code=status.HTTP_200_OK)
def agregar_entrada(data_entrada: DataAgregarEntrada, _usuario=Depends(verify_access([1, 2]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        categoria_seleccionada = data_entrada.categoria
        productos = data_entrada.productos
        nombre_donador = data_entrada.nombre_donador
        
        productos_nuevos = False
        
        productos_finales = []

        for producto in productos:
            cantidad = producto.cantidad
            unidad = producto.unidad
            nombre = producto.nombre

            if not nombre or not unidad or not cantidad:
                continue

            cursor.execute(
                "SELECT id_producto FROM productos WHERE LOWER(nombre_producto) = LOWER(?)",
                (nombre,)
            )
            row = cursor.fetchone()
            id_producto = None

            if row:
                id_producto = row[0]
            else:
                cursor.execute("""
                    INSERT INTO productos (nombre_producto, unidad)
                    OUTPUT INSERTED.id_producto
                    VALUES (?, ?)
                """, (nombre, unidad))
                id_producto = cursor.fetchone()[0]

                productos_nuevos = True

            productos_finales.append({
                "id_producto": id_producto,
                "cantidad": cantidad,
                "unidad": unidad,
                "nombre_producto": nombre
            })

        id_categoria = categoria_seleccionada.id_categoria
        nombre_categoria = categoria_seleccionada.nombre_categoria

        id_entradas_insertadas = []

        for item in productos_finales:
            cursor.execute("""
                INSERT INTO entradas (id_categoria, id_producto, cantidad)
                OUTPUT INSERTED.id_entrada
                VALUES (?, ?, ?)
            """, (id_categoria, item['id_producto'], item['cantidad']))
            id_entrada = cursor.fetchone()[0]
            id_entradas_insertadas.append(id_entrada)

        cursor.execute("""
            SELECT
                rd.id_departamento,
                rd.id_usuario,
                u.nombre_usuario,
                u.apellidos_usuario
            FROM responsables_departamento rd
            JOIN usuarios u ON rd.id_usuario = u.id_usuario
            WHERE rd.id_departamento = 2;
        """
        )
        usuario = cursor.fetchone()
        
        cursor.execute("INSERT INTO operaciones (tipo_operacion) OUTPUT INSERTED.id_operacion VALUES ('entrada')")
        num_operacion = cursor.fetchone()[0]
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "No hay ningún responsable de Almacén, por favor comuniquese con el administrador."}
            )
        
        accion = ''
        nombre_responsable_almacen = usuario[2] + " " + usuario[3]
        nombre_pdf = ''

        if id_categoria == 1:
            accion = f'Agregó una compra de {len(productos_finales)} productos'
            titulo = "ENTRADA DE COMPRAS AL ALMACÉN"
            nombre_pdf = generar_pdf_entrada(
                titulo,
                productos_finales,
                id_categoria=id_categoria,
                nombre_responsable_almacen=nombre_responsable_almacen,
                num_operacion=num_operacion
            )
        if id_categoria == 2:
            accion = f'Agregó un donativo de {len(productos_finales)} productos'
            titulo = "ENTRADA DE DONATIVOS AL ALMACÉN"
            nombre_pdf = generar_pdf_entrada(
                titulo,
                productos_finales,
                id_categoria=id_categoria,
                nombre_donador=nombre_donador,
                nombre_responsable_almacen=nombre_responsable_almacen,
                num_operacion=num_operacion
            )
        if id_categoria > 3:
            accion = f'Agregó {nombre_categoria} de {len(productos_finales)} productos'
            titulo = f"ENTRADA DE {nombre_categoria.upper()} AL ALMACÉN"
            nombre_pdf = generar_pdf_entrada(
                titulo,
                productos_finales,
                id_categoria=id_categoria,
                nombre_responsable_almacen=nombre_responsable_almacen,
                num_operacion=num_operacion
            )
        
        for id_entrada in id_entradas_insertadas:
            cursor.execute(
                """
                INSERT INTO movimiento_entradas (id_entrada, cantidad, nombre_pdf)
                SELECT id_entrada, cantidad, ? FROM entradas WHERE id_entrada = ?
                """,
                (nombre_pdf, id_entrada)
            )
                
        connection.commit()
        
        if productos_nuevos:
            print(productos_nuevos)
            print(accion)

        return {
            "message": "La entrada se ha registrado correctamente",
            "nombre_pdf": nombre_pdf
        }
    except HTTPException as err:
        raise err
    except Exception as err:
        print(f"Error interno: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error interno del servidor"}
        )
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()
