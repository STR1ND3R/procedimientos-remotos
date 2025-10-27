using System;
using System.Runtime.Remoting;
using System.Runtime.Remoting.Channels;
using System.Runtime.Remoting.Channels.Tcp;

class Program
{
    static void Main()
    {
        TcpChannel channel = new TcpChannel(8085);
        ChannelServices.RegisterChannel(channel, false);
        RemotingConfiguration.RegisterWellKnownServiceType(
            typeof(VideojuegosService),
            "VideojuegosService",
            WellKnownObjectMode.Singleton
        );
        Console.WriteLine("✅ Servidor .NET Remoting escuchando en puerto 8085");
        Console.ReadLine();
    }
}
