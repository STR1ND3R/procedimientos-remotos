import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class Main {
    public static void main(String[] args) {
        try {
            VideojuegosService service = new VideojuegosServiceImpl();
            Registry registry = LocateRegistry.createRegistry(1099);
            registry.rebind("VideojuegosService", service);
            System.out.println("✅ Servidor RMI corriendo en puerto 1099");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
