import { useNavigate } from "react-router-dom";
import { FileText, TicketCheck, Activity, BookOpen } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 1,
      title: "Adquirir Nuevo Producto Indigo",
      description: "Impulsa la innovación de tu organización. Cada nuevo producto es una oportunidad para transformar datos en decisiones estratégicas.",
      icon: FileText,
      route: "/formulario",
      gradient: "from-primary to-accent",
    },
    {
      id: 2,
      title: "Visualización de Gestión de Tickets",
      description: "Mantén el control total. La excelencia en el servicio comienza con una gestión transparente y eficiente de cada solicitud.",
      icon: TicketCheck,
      externalUrl: "https://indigocolombia.zendesk.com/auth/v2/login/signin?auth_origin=2525076%2Ctrue%2Ctrue&brand_id=2525076&locale=2&return_to=https%3A%2F%2Findigocolombia.zendesk.com%2F&role=consumer&theme=hc",
      gradient: "from-accent to-secondary",
    },
    {
      id: 3,
      title: "Reportería de Estabilidad de Servicios",
      description: "La confiabilidad es nuestra promesa. Monitorea la salud de tus servicios y garantiza una experiencia sin interrupciones.",
      icon: Activity,
      route: "/estabilidad",
      gradient: "from-secondary to-primary",
    },
    {
      id: 4,
      title: "Documentación de Productos - Indigo Academics",
      description: "El conocimiento es poder. Accede a toda la sabiduría de Indigo y maximiza el potencial de cada herramienta.",
      icon: BookOpen,
      route: "/documentacion",
      gradient: "from-accent to-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">I</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Indigo
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Inicio
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Ayuda
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Portal de Gestión Indigo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bienvenido a tu centro de control. Selecciona una opción para comenzar tu viaje hacia la excelencia operativa.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => {
                  if ('externalUrl' in card && card.externalUrl) {
                    window.open(card.externalUrl, '_blank');
                  } else if ('route' in card && card.route) {
                    navigate(card.route);
                  }
                }}
              >
                <div className="relative h-full bg-card rounded-2xl border border-border shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative p-8 flex flex-col h-full">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed flex-grow">
                      {card.description}
                    </p>

                    {/* Arrow Indicator */}
                    <div className="mt-6 flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                      <span>Acceder</span>
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Indigo. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Ayuda
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Soporte Técnico
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
