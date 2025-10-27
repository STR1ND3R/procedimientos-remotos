using System;
using System.Collections.Generic;

public interface IVideojuegosService
{
    List<Videojuego> Listar();
    Videojuego Obtener(int id);
    Videojuego Crear(Videojuego v);
    Videojuego Actualizar(Videojuego v);
    bool Eliminar(int id);
}
