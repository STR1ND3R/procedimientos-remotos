import java.rmi.server.UnicastRemoteObject;
import java.rmi.RemoteException;
import java.util.*;
import java.io.*;
import com.google.gson.reflect.TypeToken;
import com.google.gson.Gson;

public class VideojuegosServiceImpl extends UnicastRemoteObject implements VideojuegosService {
    private static final String DB_PATH = "../../videojuegos.json";
    private List<Videojuego> db;
    private Gson gson = new Gson();

    public VideojuegosServiceImpl() throws RemoteException {
        super();
        cargar();
    }

    private void cargar() {
        try {
            Reader reader = new FileReader(DB_PATH);
            db = gson.fromJson(reader, new TypeToken<List<Videojuego>>(){}.getType());
            reader.close();
        } catch (Exception e) {
            db = new ArrayList<>();
        }
    }

    private void guardar() {
        try (Writer writer = new FileWriter(DB_PATH)) {
            gson.toJson(db, writer);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<Videojuego> listar() { return db; }
    public Videojuego obtener(int id) { return db.stream().filter(j -> j.id == id).findFirst().orElse(null); }

    public Videojuego crear(Videojuego v) {
        v.id = (int)(System.currentTimeMillis() / 1000);
        db.add(v);
        guardar();
        return v;
    }

    public Videojuego actualizar(Videojuego v) {
        eliminar(v.id);
        db.add(v);
        guardar();
        return v;
    }

    public boolean eliminar(int id) {
        boolean removed = db.removeIf(j -> j.id == id);
        guardar();
        return removed;
    }
}
