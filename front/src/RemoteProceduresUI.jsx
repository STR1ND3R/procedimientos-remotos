import React, { useState } from 'react';

// Frontend component for creating and testing remote procedures
// Sin uso de localStorage - Todo en memoria durante la sesión

export default function RemoteProceduresUI() {
  const [transport, setTransport] = useState('tcp');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [technology, setTechnology] = useState('grpc');
  const [requestContent, setRequestContent] = useState('');
  const [procedures, setProcedures] = useState([
    // Ejemplos iniciales
    {
      id: 'demo1',
      name: 'ListarVideojuegos',
      transport: 'tcp',
      httpMethod: 'GET',
      technology: 'grpc',
      requestContent: '{}',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo2',
      name: 'ObtenerVideojuego',
      transport: 'tcp',
      httpMethod: 'GET',
      technology: 'rmi',
      requestContent: '{"id": 1}',
      createdAt: new Date().toISOString(),
    }
  ]);
  const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [log, setLog] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  function resetForm() {
    setName('');
    setTransport('tcp');
    setHttpMethod('GET');
    setTechnology('grpc');
    setRequestContent('');
    setSelectedId(null);
  }

  function handleAddOrUpdate() {
    if (!name.trim()) {
      alert('Asigna un nombre al procedimiento.');
      return;
    }

    const payload = {
      id: selectedId ?? Date.now().toString(),
      name: name.trim(),
      transport,
      httpMethod,
      technology,
      requestContent,
      createdAt: new Date().toISOString(),
    };

    setProcedures(prev => {
      const found = prev.find(p => p.id === payload.id);
      if (found) {
        return prev.map(p => (p.id === payload.id ? payload : p));
      }
      return [payload, ...prev];
    });

    resetForm();
    appendLog(`✅ Procedimiento "${payload.name}" ${selectedId ? 'actualizado' : 'creado'}`);
  }

  function handleEdit(proc) {
    setSelectedId(proc.id);
    setName(proc.name);
    setTransport(proc.transport);
    setHttpMethod(proc.httpMethod);
    setTechnology(proc.technology);
    setRequestContent(proc.requestContent);
    appendLog(`📝 Editando: ${proc.name}`);
  }

  function handleDelete(id) {
    const proc = procedures.find(p => p.id === id);
    if (!confirm(`¿Eliminar "${proc?.name}"?`)) return;
    setProcedures(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) resetForm();
    appendLog(`🗑️  Eliminado: ${proc?.name}`);
  }

  function prettyPreview(proc) {
    return `Procedure: ${proc.name}\nTransport: ${proc.transport}\nHTTP: ${proc.httpMethod}\nTech: ${proc.technology}\nContent:\n${proc.requestContent}`;
  }

  async function runTest(proc) {
    setIsTesting(true);
    appendLog(`> Ejecutando ${proc.name} (${proc.technology} / ${proc.httpMethod} over ${proc.transport})`);

    await wait(500);
    appendLog('-- Preparando payload...');
    await wait(700);
    appendLog('-- Enviando petición...');

    // Mock response basado en tecnología
    let mockResponse = { status: 200, body: 'OK', details: {} };
    
    if (proc.technology === 'grpc') {
      mockResponse = { 
        status: 0, 
        body: 'gRPC Response OK', 
        details: { 
          code: 0, 
          message: 'Success',
          data: [
            { id: 1, titulo: "Zelda", plataforma: "Switch" },
            { id: 2, titulo: "God of War", plataforma: "PS5" }
          ]
        } 
      };
    } else if (proc.technology === 'rmi') {
      mockResponse = { 
        status: 200, 
        body: 'RMI invocation successful', 
        details: { 
          remote: 'java.rmi.server',
          registry: 'localhost:1099',
          service: 'VideojuegosService'
        } 
      };
    } else if (proc.technology === 'netRemoting') {
      mockResponse = { 
        status: 200, 
        body: '.NET Remoting successful', 
        details: { 
          channel: proc.transport,
          endpoint: 'tcp://localhost:8085/VideojuegosService',
          assembly: 'VideojuegosService, Version=1.0'
        } 
      };
    }

    await wait(800);
    appendLog(`✅ Respuesta: ${JSON.stringify(mockResponse, null, 2)}`);
    appendLog(`📊 Estado: ${mockResponse.status === 0 || mockResponse.status === 200 ? 'SUCCESS' : 'ERROR'}`);
    setIsTesting(false);
  }

  function appendLog(text) {
    setLog(l => [
      { 
        id: Date.now().toString() + Math.random().toString(16).slice(2), 
        ts: new Date().toLocaleTimeString(), 
        text 
      },
      ...l.slice(0, 49)
    ]);
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(procedures, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `procedures_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    appendLog('📥 Procedimientos exportados a JSON');
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          setProcedures(prev => [...data, ...prev]);
          appendLog(`📤 Importados ${data.length} procedimientos`);
        } else {
          alert('Formato inválido: se esperaba un arreglo JSON.');
        }
      } catch (err) {
        alert('Error leyendo archivo: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function clearLogs() {
    setLog([]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Sistema de Procedimientos Remotos</h1>
          <p className="text-slate-600 mt-2">Crear, desplegar y probar procedimientos sobre gRPC, RMI o .NET Remoting</p>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>gRPC :50051</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>RMI :1099</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>.NET :8085</span>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <section className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">
                {selectedId ? '✏️ Editar' : '➕ Crear'} Procedimiento
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={exportJSON} 
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-medium transition"
                >
                  📥 Exportar
                </button>
                <label className="px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-sm font-medium cursor-pointer transition">
                  📤 Importar
                  <input 
                    type="file" 
                    accept="application/json" 
                    className="hidden" 
                    onChange={e => e.target.files?.[0] && importJSON(e.target.files[0])} 
                  />
                </label>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre del procedimiento
                </label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                  placeholder="e.g. GetUserById, ListarVideojuegos"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Transporte</label>
                  <div className="flex gap-2">
                    <label className={`flex-1 px-3 py-2 rounded-lg border cursor-pointer text-center transition ${transport === 'tcp' ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' : 'border-slate-300 hover:bg-slate-50'}`}>
                      <input type="radio" name="transport" checked={transport === 'tcp'} onChange={() => setTransport('tcp')} className="sr-only" /> TCP
                    </label>
                    <label className={`flex-1 px-3 py-2 rounded-lg border cursor-pointer text-center transition ${transport === 'udp' ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' : 'border-slate-300 hover:bg-slate-50'}`}>
                      <input type="radio" name="transport" checked={transport === 'udp'} onChange={() => setTransport('udp')} className="sr-only" /> UDP
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Método HTTP</label>
                  <select 
                    value={httpMethod} 
                    onChange={e => setHttpMethod(e.target.value)} 
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tecnología</label>
                  <select 
                    value={technology} 
                    onChange={e => setTechnology(e.target.value)} 
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="grpc">gRPC</option>
                    <option value="rmi">RMI (Java)</option>
                    <option value="netRemoting">.NET Remoting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contenido de la petición (JSON)
                </label>
                <textarea 
                  value={requestContent} 
                  onChange={e => setRequestContent(e.target.value)} 
                  rows={8} 
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 transition" 
                  placeholder={`{\n  "id": 123,\n  "name": "ejemplo",\n  "params": {}\n}`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleAddOrUpdate} 
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/30 transition"
                >
                  {selectedId ? '💾 Actualizar' : '➕ Crear'} Procedimiento
                </button>
                <button 
                  onClick={resetForm} 
                  className="px-6 py-3 rounded-xl border-2 border-slate-300 hover:bg-slate-50 font-medium transition"
                >
                  🔄 Limpiar
                </button>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Lista de procedimientos */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-slate-800">
                  📋 Procedimientos ({procedures.length})
                </h3>
              </div>
              
              <div className="space-y-3 max-h-[50vh] overflow-auto pr-2">
                {procedures.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <div className="text-4xl mb-2">📝</div>
                    <div className="text-sm">No hay procedimientos</div>
                  </div>
                )}
                
                {procedures.map(proc => (
                  <div key={proc.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{proc.name}</div>
                        <div className="text-xs text-slate-500 mt-1 space-x-2">
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {proc.technology}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded bg-green-50 text-green-700">
                            {proc.httpMethod}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                            {proc.transport}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => runTest(proc)} 
                        disabled={isTesting} 
                        className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        ▶️ Probar
                      </button>
                      <button 
                        onClick={() => handleEdit(proc)} 
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-medium transition"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(proc.id)} 
                        className="px-3 py-1.5 rounded-lg border border-red-300 hover:bg-red-50 text-red-600 text-sm font-medium transition"
                      >
                        🗑️
                      </button>
                    </div>

                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-800">
                        Ver contenido completo
                      </summary>
                      <pre className="mt-2 p-3 rounded-lg bg-slate-50 text-xs font-mono overflow-auto max-h-32">
                        {prettyPreview(proc)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>

            {/* Logs */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">🖥️ Registro de Ejecución</h4>
                <button 
                  onClick={clearLogs}
                  className="text-xs px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 transition"
                >
                  🧹 Limpiar
                </button>
              </div>
              
              <div className="h-64 overflow-auto rounded-lg border border-slate-200 p-3 bg-slate-900 text-slate-100 text-xs font-mono">
                {log.length === 0 && (
                  <div className="text-slate-500 text-center py-8">
                    <div className="text-2xl mb-2">⌨️</div>
                    <div>Esperando ejecuciones...</div>
                  </div>
                )}
                {log.map(l => (
                  <div key={l.id} className="mb-1.5 leading-relaxed">
                    <span className="text-slate-500">[{l.ts}]</span>{' '}
                    <span className={
                      l.text.includes('✅') ? 'text-green-400' :
                      l.text.includes('❌') || l.text.includes('ERROR') ? 'text-red-400' :
                      l.text.includes('⚠️') ? 'text-yellow-400' :
                      'text-slate-300'
                    }>
                      {l.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 text-xs text-slate-700">
              <div className="font-semibold mb-2 text-blue-900">ℹ️ Información del Sistema</div>
              <ul className="space-y-1 text-slate-600">
                <li>• Esta es una interfaz de demostración</li>
                <li>• Las pruebas son simuladas (mock)</li>
                <li>• Los datos se almacenan en memoria</li>
                <li>• Los servidores reales deben estar corriendo</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
