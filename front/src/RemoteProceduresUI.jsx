import React, { useState, useEffect } from 'react';

// Frontend component for creating and testing remote procedures
// Uses Tailwind CSS classes for styling. This is a single-file React component.

export default function RemoteProceduresUI() {
  const [transport, setTransport] = useState('tcp');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [technology, setTechnology] = useState('grpc');
  const [requestContent, setRequestContent] = useState('');
  const [procedures, setProcedures] = useState(() => {
    try {
      const raw = localStorage.getItem('rp_procedures');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [log, setLog] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    localStorage.setItem('rp_procedures', JSON.stringify(procedures));
  }, [procedures]);

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
  }

  function handleEdit(proc) {
    setSelectedId(proc.id);
    setName(proc.name);
    setTransport(proc.transport);
    setHttpMethod(proc.httpMethod);
    setTechnology(proc.technology);
    setRequestContent(proc.requestContent);
  }

  function handleDelete(id) {
    if (!confirm('¿Eliminar procedimiento?')) return;
    setProcedures(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) resetForm();
  }

  function prettyPreview(proc) {
    return `Procedure: ${proc.name}\nTransport: ${proc.transport}\nHTTP: ${proc.httpMethod}\nTech: ${proc.technology}\nContent:\n${proc.requestContent}`;
  }

  // Simulated test runner — in a real app this would call your backend orchestration
  async function runTest(proc) {
    setIsTesting(true);
    appendLog(`> Ejecutando ${proc.name} (${proc.technology} / ${proc.httpMethod} over ${proc.transport})`);

    // Simulate network / remote call
    appendLog('-- Preparando payload...');
    await wait(500);
    appendLog('-- Enviando petición...');
    await wait(700);

    // Mock response depending on technology (simple, illustrative)
    let mockResponse = { status: 200, body: 'OK', details: {} };
    if (proc.technology === 'grpc') {
      mockResponse = { status: 0, body: 'gRPC OK', details: { code: 0 } };
    } else if (proc.technology === 'rmi') {
      mockResponse = { status: 200, body: 'RMI result', details: { remote: 'java.rmi.server' } };
    } else if (proc.technology === 'netRemoting') {
      mockResponse = { status: 200, body: 'NetRemoting payload received', details: { channel: proc.transport } };
    }

    appendLog(`-- Respuesta: ${JSON.stringify(mockResponse)}`);
    setIsTesting(false);
  }

  function appendLog(text) {
    setLog(l => [
      { id: Date.now().toString() + Math.random().toString(16).slice(2), ts: new Date().toLocaleTimeString(), text },
      ...l,
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
    a.download = 'procedures_export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          setProcedures(data.concat(procedures));
          alert('Importación completada.');
        } else {
          alert('Formato inválido: se esperaba un arreglo JSON.');
        }
      } catch (err) {
        alert('Error leyendo archivo: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Sistema de Procedimientos Remotos</h1>
          <p className="text-sm text-slate-600">Crear, desplegar y probar procedimientos sobre gRPC, RMI o .NET Remoting (UI demo).</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <section className="col-span-1 lg:col-span-2 bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Crear / Editar Procedimiento</h2>
              <div className="flex gap-2">
                <button onClick={exportJSON} className="px-3 py-1 rounded-md border text-sm">Exportar JSON</button>
                <label className="px-3 py-1 rounded-md border bg-slate-50 text-sm cursor-pointer">
                  Importar
                  <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files?.[0] && importJSON(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nombre del procedimiento</label>
                <input value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" placeholder="e.g. GetUserById" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium">Transporte</label>
                  <div className="mt-1 flex gap-2">
                    <label className={`px-3 py-1 rounded-md border cursor-pointer ${transport === 'tcp' ? 'bg-slate-100' : ''}`}>
                      <input type="radio" name="transport" checked={transport === 'tcp'} onChange={() => setTransport('tcp')} className="mr-2" /> TCP
                    </label>
                    <label className={`px-3 py-1 rounded-md border cursor-pointer ${transport === 'udp' ? 'bg-slate-100' : ''}`}>
                      <input type="radio" name="transport" checked={transport === 'udp'} onChange={() => setTransport('udp')} className="mr-2" /> UDP
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Método HTTP</label>
                  <select value={httpMethod} onChange={e => setHttpMethod(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Tecnología remota</label>
                  <select value={technology} onChange={e => setTechnology(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
                    <option value="grpc">gRPC</option>
                    <option value="rmi">RMI</option>
                    <option value="netRemoting">.NET Remoting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Contenido de la petición</label>
                <textarea value={requestContent} onChange={e => setRequestContent(e.target.value)} rows={7} className="mt-1 block w-full rounded-md border px-3 py-2 font-mono text-sm" placeholder='{
  "id": 123,
  "name": "ejemplo"
}' />
              </div>

              <div className="flex gap-2">
                <button onClick={handleAddOrUpdate} className="px-4 py-2 rounded-xl bg-slate-800 text-white">{selectedId ? 'Actualizar' : 'Crear'}</button>
                <button onClick={resetForm} className="px-4 py-2 rounded-xl border">Limpiar</button>
              </div>
            </div>
          </section>

          {/* Sidebar: procedures list & runner */}
          <aside className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-3">Procedimientos</h3>
            <div className="space-y-3 max-h-[46vh] overflow-auto">
              {procedures.length === 0 && <div className="text-sm text-slate-500">No hay procedimientos. Crea uno usando el formulario.</div>}
              {procedures.map(proc => (
                <div key={proc.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{proc.name}</div>
                      <div className="text-xs text-slate-500">{proc.technology} • {proc.httpMethod} • {proc.transport}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(proc)} title="Editar" className="px-2 py-1 border rounded">Editar</button>
                      <button onClick={() => runTest(proc)} disabled={isTesting} title="Probar" className="px-2 py-1 rounded bg-emerald-500 text-white">Probar</button>
                      <button onClick={() => handleDelete(proc.id)} title="Eliminar" className="px-2 py-1 border rounded">Eliminar</button>
                    </div>
                  </div>

                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer">Ver petición / vista previa</summary>
                    <pre className="mt-2 p-2 rounded bg-slate-50 text-xs font-mono overflow-auto">{prettyPreview(proc)}</pre>
                  </details>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Registro (logs)</h4>
              <div className="h-48 overflow-auto rounded border p-2 bg-black text-white text-xs font-mono">
                {log.length === 0 && <div className="text-slate-400">Aquí aparecerán los logs de ejecución.</div>}
                {log.map(l => (
                  <div key={l.id} className="mb-1"><span className="text-slate-400">[{l.ts}]</span> {l.text}</div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">Nota: esta interfaz es un prototipo de frontend. La ejecución real de gRPC/RMI/.NET Remoting debe implementarse en el backend correspondiente que exponga endpoints para ejecutar las llamadas remotas.</div>
          </aside>
        </main>
      </div>
    </div>
  );
}
