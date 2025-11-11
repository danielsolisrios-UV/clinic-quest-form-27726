import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TicketCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Tickets = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("todos");

  const metricas = {
    abiertos: 24,
    cerrados: 156,
    promedioResolucion: "4.2h",
    satisfaccion: "94%",
  };

  const dataPrioridad = [
    { name: "Alta", value: 8, color: "hsl(var(--destructive))" },
    { name: "Media", value: 12, color: "hsl(var(--warning))" },
    { name: "Baja", value: 4, color: "hsl(var(--success))" },
  ];

  const dataRendimiento = [
    { mes: "Ene", tickets: 45 },
    { mes: "Feb", tickets: 52 },
    { mes: "Mar", tickets: 48 },
    { mes: "Abr", tickets: 61 },
    { mes: "May", tickets: 55 },
    { mes: "Jun", tickets: 67 },
  ];

  const tickets = [
    { id: "TK-001", titulo: "Error en módulo de reportes", prioridad: "alta", estado: "abierto", fecha: "2024-01-15", tiempo: "2h" },
    { id: "TK-002", titulo: "Solicitud de acceso a dashboard", prioridad: "media", estado: "proceso", fecha: "2024-01-14", tiempo: "5h" },
    { id: "TK-003", titulo: "Actualización de permisos", prioridad: "baja", estado: "cerrado", fecha: "2024-01-14", tiempo: "3h" },
    { id: "TK-004", titulo: "Consulta sobre integración API", prioridad: "media", estado: "abierto", fecha: "2024-01-13", tiempo: "8h" },
    { id: "TK-005", titulo: "Bug en formulario de registro", prioridad: "alta", estado: "proceso", fecha: "2024-01-13", tiempo: "4h" },
  ];

  const ticketsFiltrados = filter === "todos" ? tickets : tickets.filter(t => t.estado === filter);

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta": return "text-destructive bg-destructive/10";
      case "media": return "text-warning bg-warning/10";
      case "baja": return "text-success bg-success/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "abierto": return <AlertCircle className="w-4 h-4" />;
      case "proceso": return <Clock className="w-4 h-4" />;
      case "cerrado": return <CheckCircle2 className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Volver al inicio</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
            <TicketCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Tickets</h1>
            <p className="text-muted-foreground">Monitorea y administra todas las solicitudes de soporte</p>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Tickets Abiertos</p>
            <p className="text-3xl font-bold text-warning">{metricas.abiertos}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Tickets Cerrados</p>
            <p className="text-3xl font-bold text-success">{metricas.cerrados}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Tiempo Promedio</p>
            <p className="text-3xl font-bold text-primary">{metricas.promedioResolucion}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Satisfacción</p>
            <p className="text-3xl font-bold text-accent">{metricas.satisfaccion}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tickets por Mes</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dataRendimiento}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribución por Prioridad</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dataPrioridad}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataPrioridad.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("todos")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "todos" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter("abierto")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "abierto" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Abiertos
            </button>
            <button
              onClick={() => setFilter("proceso")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "proceso" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              En Proceso
            </button>
            <button
              onClick={() => setFilter("cerrado")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "cerrado" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Cerrados
            </button>
          </div>
        </div>

        {/* Tabla de Tickets */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Título</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Prioridad</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Estado</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Fecha</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {ticketsFiltrados.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{ticket.id}</td>
                    <td className="p-4 text-sm text-foreground">{ticket.titulo}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPrioridadColor(ticket.prioridad)}`}>
                        {ticket.prioridad.charAt(0).toUpperCase() + ticket.prioridad.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getEstadoIcon(ticket.estado)}
                        <span className="text-sm text-foreground capitalize">{ticket.estado}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{ticket.fecha}</td>
                    <td className="p-4 text-sm text-muted-foreground">{ticket.tiempo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tickets;
