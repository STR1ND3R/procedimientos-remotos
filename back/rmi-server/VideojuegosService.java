import java.rmi.*;
import java.util.List;

public interface VideojuegosService extends Remote {
    List<Videojuego> listar() throws RemoteException;
    Videojuego obtener(int id) throws RemoteException;
    Videojuego crear(Videojuego v) throws RemoteException;
    Videojuego actualizar(Videojuego v) throws RemoteException;
    boolean eliminar(int id) throws RemoteException;
}
