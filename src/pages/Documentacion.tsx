import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Search, Download, MessageCircle, Send, Bot } from "lucide-react";

const Documentacion = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", content: "¡Hola! Soy tu asistente de Indigo Academics. ¿En qué puedo ayudarte hoy?" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const categorias = [
    {
      nombre: "Primeros Pasos",
      documentos: [
        { titulo: "Guía de Inicio Rápido", tipo: "PDF", tamaño: "2.4 MB" },
        { titulo: "Configuración Inicial", tipo: "PDF", tamaño: "1.8 MB" },
        { titulo: "Conceptos Básicos", tipo: "PDF", tamaño: "3.1 MB" },
      ],
    },
    {
      nombre: "API y Desarrollo",
      documentos: [
        { titulo: "Referencia de API", tipo: "PDF", tamaño: "5.2 MB" },
        { titulo: "Ejemplos de Integración", tipo: "PDF", tamaño: "4.7 MB" },
        { titulo: "Best Practices", tipo: "PDF", tamaño: "2.9 MB" },
      ],
    },
    {
      nombre: "Reportes y Analytics",
      documentos: [
        { titulo: "Creación de Dashboards", tipo: "PDF", tamaño: "3.6 MB" },
        { titulo: "KPIs y Métricas", tipo: "PDF", tamaño: "2.2 MB" },
        { titulo: "Exportación de Datos", tipo: "PDF", tamaño: "1.5 MB" },
      ],
    },
    {
      nombre: "Seguridad y Permisos",
      documentos: [
        { titulo: "Gestión de Usuarios", tipo: "PDF", tamaño: "2.8 MB" },
        { titulo: "Roles y Permisos", tipo: "PDF", tamaño: "2.1 MB" },
        { titulo: "Autenticación SSO", tipo: "PDF", tamaño: "3.4 MB" },
      ],
    },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: "user", content: inputMessage };
    setChatMessages([...chatMessages, userMessage]);

    // Respuestas predefinidas del bot
    setTimeout(() => {
      let botResponse = "";
      const lowerInput = inputMessage.toLowerCase();

      if (lowerInput.includes("api") || lowerInput.includes("integración")) {
        botResponse = "Para integraciones con la API de Indigo, te recomiendo revisar nuestra 'Referencia de API' y 'Ejemplos de Integración' en la sección de API y Desarrollo. ¿Necesitas ayuda con algún endpoint específico?";
      } else if (lowerInput.includes("reporte") || lowerInput.includes("dashboard")) {
        botResponse = "Puedes crear dashboards personalizados siguiendo nuestra guía 'Creación de Dashboards'. También tenemos documentación sobre KPIs y exportación de datos. ¿Qué tipo de reporte necesitas crear?";
      } else if (lowerInput.includes("usuario") || lowerInput.includes("permiso")) {
        botResponse = "Para gestión de usuarios y permisos, consulta la sección de Seguridad. Tenemos guías sobre roles, permisos y autenticación SSO. ¿Necesitas configurar accesos específicos?";
      } else if (lowerInput.includes("inicio") || lowerInput.includes("empezar")) {
        botResponse = "¡Excelente! Te recomiendo comenzar con la 'Guía de Inicio Rápido' y 'Configuración Inicial' en la sección de Primeros Pasos. Estos documentos te darán una base sólida para usar Indigo.";
      } else {
        botResponse = "Entiendo tu consulta. Puedes buscar documentación específica usando el buscador arriba, o explora las categorías disponibles. ¿Hay algo más específico que quieras saber?";
      }

      setChatMessages(prev => [...prev, { role: "bot", content: botResponse }]);
    }, 1000);

    setInputMessage("");
  };

  const documentosFiltrados = categorias.map(cat => ({
    ...cat,
    documentos: cat.documentos.filter(doc =>
      doc.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(cat => cat.documentos.length > 0);

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
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Indigo Academics</h1>
            <p className="text-muted-foreground">Centro de conocimiento y asistencia inteligente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Documentación */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buscador */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar documentación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Categorías */}
            {(searchTerm ? documentosFiltrados : categorias).map((categoria, index) => (
              <div key={index} className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">{categoria.nombre}</h3>
                <div className="space-y-3">
                  {categoria.documentos.map((doc, docIndex) => (
                    <div
                      key={docIndex}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{doc.titulo}</p>
                          <p className="text-sm text-muted-foreground">{doc.tipo} • {doc.tamaño}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-background rounded-lg transition-colors">
                        <Download className="w-5 h-5 text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Chatbot */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-accent to-primary p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Asistente Indigo</h3>
                  <p className="text-xs text-white/80">Siempre aquí para ayudarte</p>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe tu pregunta..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-grow px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documentacion;
