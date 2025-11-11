import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const Estabilidad = () => {
  const navigate = useNavigate();

  const servicios = [
    { nombre: "API Gateway", estado: "activo", uptime: "99.98%", latencia: "45ms" },
    { nombre: "Base de Datos", estado: "activo", uptime: "99.95%", latencia: "12ms" },
    { nombre: "Servidor Web", estado: "activo", uptime: "99.99%", latencia: "28ms" },
    { nombre: "Storage Service", estado: "mantenimiento", uptime: "98.50%", latencia: "95ms" },
    { nombre: "Email Service", estado: "activo", uptime: "99.92%", latencia: "120ms" },
    { nombre: "Analytics Engine", estado: "activo", uptime: "99.88%", latencia: "67ms" },
  ];

  const dataUptime = [
    { hora: "00:00", disponibilidad: 99.9 },
    { hora: "04:00", disponibilidad: 99.95 },
    { hora: "08:00", disponibilidad: 99.98 },
    { hora: "12:00", disponibilidad: 99.92 },
    { hora: "16:00", disponibilidad: 99.88 },
    { hora: "20:00", disponibilidad: 99.95 },
    { hora: "24:00", disponibilidad: 99.97 },
  ];

  const dataLatencia = [
    { hora: "00:00", latencia: 45 },
    { hora: "04:00", latencia: 38 },
    { hora: "08:00", latencia: 52 },
    { hora: "12:00", latencia: 68 },
    { hora: "16:00", latencia: 72 },
    { hora: "20:00", latencia: 55 },
    { hora: "24:00", latencia: 48 },
  ];

  const incidentes = [
    { id: 1, titulo: "Mantenimiento programado - Storage", fecha: "2024-01-15 10:00", severidad: "bajo", estado: "activo" },
    { id: 2, titulo: "Latencia elevada en API Gateway", fecha: "2024-01-14 15:30", severidad: "medio", estado: "resuelto" },
    { id: 3, titulo: "Indisponibilidad parcial Base de Datos", fecha: "2024-01-12 08:45", severidad: "alto", estado: "resuelto" },
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activo": return "text-success bg-success/10";
      case "mantenimiento": return "text-warning bg-warning/10";
      case "inactivo": return "text-destructive bg-destructive/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "activo": return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "mantenimiento": return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "inactivo": return <XCircle className="w-5 h-5 text-destructive" />;
      default: return null;
    }
  };

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case "alto": return "text-destructive bg-destructive/10";
      case "medio": return "text-warning bg-warning/10";
      case "bajo": return "text-success bg-success/10";
      default: return "text-muted-foreground bg-muted";
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
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Estabilidad de Servicios</h1>
            <p className="text-muted-foreground">Monitoreo en tiempo real del estado y rendimiento de la plataforma</p>
          </div>
        </div>

        {/* Estado de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {servicios.map((servicio, index) => (
            <div key={index} className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getEstadoIcon(servicio.estado)}
                  <h3 className="font-semibold text-foreground">{servicio.nombre}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(servicio.estado)}`}>
                  {servicio.estado === "activo" ? "Activo" : "Mantenimiento"}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="font-medium text-foreground">{servicio.uptime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Latencia:</span>
                  <span className="font-medium text-foreground">{servicio.latencia}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gráficos de Rendimiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Disponibilidad (24h)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dataUptime}>
                <defs>
                  <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hora" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[99.5, 100]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="disponibilidad" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorUptime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Latencia Promedio (24h)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dataLatencia}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hora" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="latencia" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidentes Recientes */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Incidentes y Mantenimientos</h3>
          <div className="space-y-4">
            {incidentes.map((incidente) => (
              <div key={incidente.id} className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-foreground">{incidente.titulo}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeveridadColor(incidente.severidad)}`}>
                      {incidente.severidad === "alto" ? "Alta" : incidente.severidad === "medio" ? "Media" : "Baja"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{incidente.fecha}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  incidente.estado === "activo" ? "text-warning bg-warning/10" : "text-success bg-success/10"
                }`}>
                  {incidente.estado === "activo" ? "Activo" : "Resuelto"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Estabilidad;
