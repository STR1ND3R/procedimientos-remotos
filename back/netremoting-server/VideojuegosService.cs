using System;
using System.IO;
using System.Collections.Generic;
using Newtonsoft.Json;

public class VideojuegosService : MarshalByRefObject, IVideojuegosService
{
    private string path = "../../videojuegos.json";
    private List<Videojuego> db = new List<Videojuego>();

    public VideojuegosService()
    {
        if (File.Exists(path))
            db = JsonConvert.DeserializeObject<List<Videojuego>>(File.ReadAllText(path));
    }

    private void Guardar() =>
        File.WriteAllText(path, JsonConvert.SerializeObject(db, Formatting.Indented));

    public List<Videojuego> Listar() => db;

    public Videojuego Obtener(int id) => db.Find(j => j.Id == id);

    public Videojuego Crear(Videojuego v)
    {
        v.Id = (int)DateTimeOffset.Now.ToUnixTimeSeconds();
        db.Add(v);
        Guardar();
        return v;
    }

    public Videojuego Actualizar(Videojuego v)
    {
        Eliminar(v.Id);
        db.Add(v);
        Guardar();
        return v;
    }

    public bool Eliminar(int id)
    {
        var removed = db.RemoveAll(j => j.Id == id) > 0;
        Guardar();
        return removed;
    }
}
