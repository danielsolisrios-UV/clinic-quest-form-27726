import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Award, Download, CheckCircle, Building2, MapPin, Stethoscope, Activity, Star, Trophy, Lock, Save, LogOut, Loader2 } from 'lucide-react';
import { departamentos, municipiosPorDepartamento } from '@/data/colombiaData';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface InformacionGeneral {
  nit?: string;
  naturaleza?: string;
  departamento?: string;
  municipio?: string;
  razonSocial?: string;
  nombreGerente?: string;
  telefono?: string;
  direccion?: string;
  personaContacto?: string;
  cargo?: string;
  numeroSedes?: string;
  cantidadEmpleados?: string;
}

interface Sede {
  nombreSede?: string;
  departamento?: string;
  ciudad?: string;
  telefono?: string;
  direccion?: string;
  nivelComplejidad?: string;
  numeroCamas?: string;
  softwareAsistencial?: string;
  softwareAdministrativo?: string;
}

interface ServicioHabilitado {
  nombreServicio?: string;
  ambulatorio?: string;
  internacion?: string;
  nombreSede?: string;
}

interface CapacidadInstalada {
  consultorios?: string;
  consultoriosRias?: string;
  camasObservacion?: string;
  camasHospitalizacion?: string;
  camasUci?: string;
  salasCirugia?: string;
  contabilidad?: string;
  facturacion?: string;
  empleadosNomina?: string;
  portalEmpleados?: string;
}

interface FormData {
  informacionGeneral: InformacionGeneral;
  sedes: Sede[];
  serviciosHabilitados: ServicioHabilitado[];
  capacidadInstalada: CapacidadInstalada;
}

const FormularioClinicoGamificado = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    informacionGeneral: {},
    sedes: [{}],
    serviciosHabilitados: [{}],
    capacidadInstalada: {}
  });
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState<number[]>([]);
  const [showAchievement, setShowAchievement] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validación y formato de campos numéricos
  const validateNumericField = (value: string, fieldType: 'integer' | 'phone' | 'nit'): { isValid: boolean; error?: string } => {
    if (!value) return { isValid: true }; // Campos vacíos se validan en el submit

    switch (fieldType) {
      case 'integer':
        if (!/^\d+$/.test(value)) {
          return { isValid: false, error: 'Solo se permiten números enteros positivos' };
        }
        if (parseInt(value) < 1) {
          return { isValid: false, error: 'El valor mínimo es 1' };
        }
        return { isValid: true };

      case 'phone':
        const phoneDigits = value.replace(/\D/g, '');
        if (phoneDigits.length > 0 && phoneDigits.length !== 10) {
          return { isValid: false, error: 'El teléfono debe tener exactamente 10 dígitos' };
        }
        return { isValid: true };

      case 'nit':
        // Formato NIT colombiano: 123456789-0 o sin guión
        const nitPattern = /^\d{1,9}(-?\d)?$/;
        if (!nitPattern.test(value)) {
          return { isValid: false, error: 'Formato de NIT inválido. Use: 123456789-0' };
        }
        return { isValid: true };

      default:
        return { isValid: true };
    }
  };

  const formatPhoneInput = (value: string): string => {
    // Remover todos los caracteres no numéricos
    const digits = value.replace(/\D/g, '');
    // Limitar a 10 dígitos
    return digits.slice(0, 10);
  };

  const formatNitInput = (value: string): string => {
    // Remover todos los caracteres excepto números y guión
    let cleaned = value.replace(/[^\d-]/g, '');
    
    // Asegurar que solo haya un guión y que esté antes del último dígito
    const parts = cleaned.split('-');
    if (parts.length > 2) {
      cleaned = parts[0] + '-' + parts.slice(1).join('');
    }
    
    return cleaned;
  };

  const formatIntegerInput = (value: string): string => {
    // Solo permitir dígitos
    return value.replace(/\D/g, '');
  };

  const handleNumericInputChange = (
    section: string,
    field: string,
    value: string,
    fieldType: 'integer' | 'phone' | 'nit'
  ) => {
    // Formatear el valor según el tipo de campo
    let formattedValue = value;
    switch (fieldType) {
      case 'integer':
        formattedValue = formatIntegerInput(value);
        break;
      case 'phone':
        formattedValue = formatPhoneInput(value);
        break;
      case 'nit':
        formattedValue = formatNitInput(value);
        break;
    }

    // Validar el campo
    const validation = validateNumericField(formattedValue, fieldType);
    
    // Actualizar errores de validación
    const errorKey = `${section}.${field}`;
    if (!validation.isValid && validation.error) {
      setValidationErrors(prev => ({ ...prev, [errorKey]: validation.error! }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }

    // Actualizar el formulario
    handleInputChange(section, field, formattedValue);
  };

  const sections = [
    { 
      id: 'informacionGeneral', 
      name: 'Información General', 
      icon: Building2, 
      color: 'from-blue-500 to-blue-600',
      points: 100
    },
    { 
      id: 'sedes', 
      name: 'Sedes', 
      icon: MapPin, 
      color: 'from-purple-500 to-purple-600',
      points: 200
    },
    { 
      id: 'serviciosHabilitados', 
      name: 'Servicios Habilitados', 
      icon: Stethoscope, 
      color: 'from-green-500 to-green-600',
      points: 150
    },
    { 
      id: 'capacidadInstalada', 
      name: 'Capacidad Instalada', 
      icon: Activity, 
      color: 'from-orange-500 to-orange-600',
      points: 250
    }
  ];

  const achievementsList = [
    { id: 1, name: 'Primer Paso', description: 'Completaste tu primera sección', icon: Star, points: 50 },
    { id: 2, name: 'A Medio Camino', description: 'Completaste 50% del formulario', icon: Trophy, points: 100 },
    { id: 3, name: 'Maestro del Formulario', description: 'Completaste todas las secciones', icon: Award, points: 200 },
  ];

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (showAchievement) {
      setTimeout(() => setShowAchievement(null), 3000);
    }
  }, [showAchievement]);

  // Load saved data from database on mount
  useEffect(() => {
    const loadFormData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('form_data')
          .select('form_content')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading form data:', error);
          return;
        }

        if (data && data.form_content) {
          const content = data.form_content as any;
          setFormData(content.formData || {
            informacionGeneral: {},
            sedes: [{}],
            serviciosHabilitados: [{}],
            capacidadInstalada: {}
          });
          setCompletedSections(content.completedSections || []);
          setTotalPoints(content.totalPoints || 0);
          setAchievements(content.achievements || []);
          toast.success('Datos cargados correctamente');
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    if (user) {
      loadFormData();
    }
  }, [user]);

  // Auto-assign sede name if there's only one sede
  useEffect(() => {
    const sedesConNombre = formData.sedes.filter(sede => sede.nombreSede);
    const nombresSedes = sedesConNombre.map(sede => sede.nombreSede);
    
    if (nombresSedes.length === 1) {
      const updated = formData.serviciosHabilitados.map(servicio => ({
        ...servicio,
        nombreSede: nombresSedes[0]
      }));
      if (JSON.stringify(updated) !== JSON.stringify(formData.serviciosHabilitados)) {
        setFormData(prev => ({ ...prev, serviciosHabilitados: updated }));
      }
    }
  }, [formData.sedes, formData.serviciosHabilitados]);

  // Auto-save to database
  useEffect(() => {
    const autoSave = async () => {
      if (!user) return;

      setIsSaving(true);
      try {
        const dataToSave = {
          formData,
          completedSections,
          totalPoints,
          achievements,
          lastSaved: new Date().toISOString()
        };

        const { error } = await supabase
          .from('form_data')
          .upsert(
            {
              user_id: user.id,
              form_content: dataToSave as any
            },
            {
              onConflict: 'user_id'
            }
          );

        if (error) {
          console.error('Error saving form data:', error);
          toast.error('Error al guardar los datos');
        }
      } catch (error) {
        console.error('Error saving:', error);
      } finally {
        setIsSaving(false);
      }
    };

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save (debounce)
    const timeout = setTimeout(() => {
      autoSave();
    }, 1000);

    setSaveTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [formData, completedSections, totalPoints, achievements, user]);

  // Save data function (manual save)
  const saveProgress = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const dataToSave = {
        formData,
        completedSections,
        totalPoints,
        achievements,
        lastSaved: new Date().toISOString()
      };

      const { error } = await supabase
        .from('form_data')
        .upsert(
          {
            user_id: user.id,
            form_content: dataToSave as any
          },
          {
            onConflict: 'user_id'
          }
        );

      if (error) {
        console.error('Error saving form data:', error);
        toast.error('Error al guardar los datos');
      } else {
        toast.success('Progreso guardado exitosamente');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error al guardar los datos');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: section === 'sedes' || section === 'serviciosHabilitados' 
        ? (prev[section as keyof typeof prev] as any[]).map((item, idx) => idx === 0 ? { ...item, [field]: value } : item)
        : { ...(prev[section as keyof typeof prev] as object), [field]: value }
    }));
  };

  const addSedeOrService = (section: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section as keyof typeof prev] as any[]), {}]
    }));
  };

  const checkSectionCompletion = (sectionId: string) => {
    const section = formData[sectionId as keyof typeof formData];
    if (!section) return false;
    
    if (sectionId === 'informacionGeneral') {
      return (section as any).nit && (section as any).razonSocial && (section as any).departamento;
    } else if (sectionId === 'sedes') {
      return (section as any)[0]?.nombreSede && (section as any)[0]?.departamento;
    } else if (sectionId === 'serviciosHabilitados') {
      return (section as any)[0]?.nombreServicio;
    } else if (sectionId === 'capacidadInstalada') {
      return (section as any).consultorios !== undefined;
    }
    return false;
  };

  const completeSection = () => {
    const sectionId = sections[currentSection].id;
    if (!completedSections.includes(sectionId) && checkSectionCompletion(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
      setTotalPoints(prev => prev + sections[currentSection].points);
      
      // Check achievements
      if (completedSections.length === 0) {
        const achievement = achievementsList[0];
        setAchievements([...achievements, achievement.id]);
        setShowAchievement(achievement);
        setTotalPoints(prev => prev + achievement.points);
      } else if (completedSections.length === 1) {
        const achievement = achievementsList[1];
        setAchievements([...achievements, achievement.id]);
        setShowAchievement(achievement);
        setTotalPoints(prev => prev + achievement.points);
      } else if (completedSections.length === 3) {
        const achievement = achievementsList[2];
        setAchievements([...achievements, achievement.id]);
        setShowAchievement(achievement);
        setTotalPoints(prev => prev + achievement.points);
      }
    }
    
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const exportToText = () => {
    let text = "=== FORMULARIO DE REGISTRO CLÍNICO ===\n\n";
    
    text += "--- INFORMACIÓN GENERAL ---\n";
    Object.entries(formData.informacionGeneral).forEach(([key, value]) => {
      text += `${key.toUpperCase()}: ${value}\n`;
    });
    
    text += "\n--- SEDES ---\n";
    formData.sedes.forEach((sede, idx) => {
      if (Object.keys(sede).length > 0) {
        text += `\nSede ${idx + 1}:\n`;
        Object.entries(sede).forEach(([key, value]) => {
          text += `  ${key.toUpperCase()}: ${value}\n`;
        });
      }
    });
    
    text += "\n--- SERVICIOS HABILITADOS ---\n";
    formData.serviciosHabilitados.forEach((servicio, idx) => {
      if (Object.keys(servicio).length > 0) {
        text += `\nServicio ${idx + 1}:\n`;
        Object.entries(servicio).forEach(([key, value]) => {
          text += `  ${key.toUpperCase()}: ${value}\n`;
        });
      }
    });
    
    text += "\n--- CAPACIDAD INSTALADA ---\n";
    Object.entries(formData.capacidadInstalada).forEach(([key, value]) => {
      text += `${key.toUpperCase()}: ${value}\n`;
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formulario_clinico.txt';
    a.click();
  };

  const renderProgressBar = () => {
    const progress = (completedSections.length / sections.length) * 100;
    return (
      <div className="w-full bg-muted rounded-full h-3 mb-6 relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse-soft"></div>
        </div>
      </div>
    );
  };

  const renderInformacionGeneral = () => {
    const selectedDepartamento = (formData.informacionGeneral as any).departamento || '';
    const municipiosDisponibles = selectedDepartamento ? municipiosPorDepartamento[selectedDepartamento] || [] : [];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">NIT de la Empresa *</label>
            <input
              type="text"
              className={`w-full px-3 py-2 border ${validationErrors['informacionGeneral.nit'] ? 'border-destructive' : 'border-input'} bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition`}
              value={(formData.informacionGeneral as any).nit || ''}
              onChange={(e) => handleNumericInputChange('informacionGeneral', 'nit', e.target.value, 'nit')}
              placeholder="123456789-0"
            />
            {validationErrors['informacionGeneral.nit'] && (
              <p className="text-sm text-destructive mt-1">{validationErrors['informacionGeneral.nit']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Naturaleza Jurídica</label>
            <select
              className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary"
              value={(formData.informacionGeneral as any).naturaleza || ''}
              onChange={(e) => handleInputChange('informacionGeneral', 'naturaleza', e.target.value)}
            >
              <option value="">Seleccione</option>
              <option value="SAS">S.A.S</option>
              <option value="SA">S.A</option>
              <option value="LTDA">LTDA</option>
              <option value="IPS">IPS</option>
              <option value="ESE">E.S.E</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Departamento *</label>
            <select
              className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary"
              value={selectedDepartamento}
              onChange={(e) => {
                handleInputChange('informacionGeneral', 'departamento', e.target.value);
                handleInputChange('informacionGeneral', 'municipio', '');
              }}
            >
              <option value="">Seleccione un departamento</option>
              {departamentos.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Municipio</label>
            <select
              className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              value={(formData.informacionGeneral as any).municipio || ''}
              onChange={(e) => handleInputChange('informacionGeneral', 'municipio', e.target.value)}
              disabled={!selectedDepartamento}
            >
              <option value="">Seleccione un municipio</option>
              {municipiosDisponibles.map((municipio) => (
                <option key={municipio} value={municipio}>{municipio}</option>
              ))}
            </select>
          </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1">Razón Social *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary"
            value={(formData.informacionGeneral as any).razonSocial || ''}
            onChange={(e) => handleInputChange('informacionGeneral', 'razonSocial', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nombre Gerente</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary"
            value={(formData.informacionGeneral as any).nombreGerente || ''}
            onChange={(e) => handleInputChange('informacionGeneral', 'nombreGerente', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
          <input
            type="tel"
            className={`w-full px-3 py-2 border ${validationErrors['informacionGeneral.telefono'] ? 'border-destructive' : 'border-input'} bg-background rounded-lg focus:ring-2 focus:ring-primary`}
            value={(formData.informacionGeneral as any).telefono || ''}
            onChange={(e) => handleNumericInputChange('informacionGeneral', 'telefono', e.target.value, 'phone')}
            placeholder="3001234567"
            maxLength={10}
          />
          {validationErrors['informacionGeneral.telefono'] && (
            <p className="text-sm text-destructive mt-1">{validationErrors['informacionGeneral.telefono']}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary"
            value={(formData.informacionGeneral as any).direccion || ''}
            onChange={(e) => handleInputChange('informacionGeneral', 'direccion', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Persona de Contacto</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary"
            value={(formData.informacionGeneral as any).personaContacto || ''}
            onChange={(e) => handleInputChange('informacionGeneral', 'personaContacto', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Cargo</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary"
            value={(formData.informacionGeneral as any).cargo || ''}
            onChange={(e) => handleInputChange('informacionGeneral', 'cargo', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">N° de Sedes</label>
          <input
            type="text"
            inputMode="numeric"
            className={`w-full px-3 py-2 border ${validationErrors['informacionGeneral.numeroSedes'] ? 'border-destructive' : 'border-input'} bg-background rounded-lg focus:ring-2 focus:ring-primary`}
            value={(formData.informacionGeneral as any).numeroSedes || ''}
            onChange={(e) => handleNumericInputChange('informacionGeneral', 'numeroSedes', e.target.value, 'integer')}
            placeholder="Ejemplo: 1"
          />
          {validationErrors['informacionGeneral.numeroSedes'] && (
            <p className="text-sm text-destructive mt-1">{validationErrors['informacionGeneral.numeroSedes']}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Cantidad de Empleados</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary"
            value={(formData.informacionGeneral as any).cantidadEmpleados || ''}
            onChange={(e) => handleInputChange('informacionGeneral', 'cantidadEmpleados', e.target.value)}
          />
        </div>
      </div>
    </div>
    );
  };

  const renderSedes = () => {
    const numeroSedes = parseInt((formData.informacionGeneral as any).numeroSedes || '0');
    const canAddMoreSedes = numeroSedes === 0 || formData.sedes.length < numeroSedes;

    return (
      <div className="space-y-6">
        {numeroSedes === 1 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-foreground">
            <p>📍 Solo se permite una sede según la información general</p>
          </div>
        )}
        {formData.sedes.map((sede, index) => {
          const selectedDepartamento = sede.departamento || '';
          const municipiosDisponibles = selectedDepartamento ? municipiosPorDepartamento[selectedDepartamento] || [] : [];

          return (
            <div key={index} className="bg-muted/50 p-4 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Sede {index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nombre de la Sede *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-secondary"
                    value={sede.nombreSede || ''}
                    onChange={(e) => {
                      const newSedes = [...formData.sedes];
                      newSedes[index].nombreSede = e.target.value;
                      setFormData({ ...formData, sedes: newSedes });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Departamento *</label>
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-secondary"
                    value={selectedDepartamento}
                    onChange={(e) => {
                      const newSedes = [...formData.sedes];
                      newSedes[index].departamento = e.target.value;
                      newSedes[index].ciudad = '';
                      setFormData({ ...formData, sedes: newSedes });
                    }}
                  >
                    <option value="">Seleccione un departamento</option>
                    {departamentos.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Ciudad</label>
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    value={sede.ciudad || ''}
                    onChange={(e) => {
                      const newSedes = [...formData.sedes];
                      newSedes[index].ciudad = e.target.value;
                      setFormData({ ...formData, sedes: newSedes });
                    }}
                    disabled={!selectedDepartamento}
                  >
                    <option value="">Seleccione una ciudad</option>
                    {municipiosDisponibles.map((municipio) => (
                      <option key={municipio} value={municipio}>{municipio}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
                  <input
                    type="tel"
                    className={`w-full px-3 py-2 border ${validationErrors[`sedes.${index}.telefono`] ? 'border-destructive' : 'border-input'} bg-background rounded-lg focus:ring-2 focus:ring-secondary`}
                    value={sede.telefono || ''}
                    onChange={(e) => {
                      const formattedValue = formatPhoneInput(e.target.value);
                      const validation = validateNumericField(formattedValue, 'phone');
                      
                      const errorKey = `sedes.${index}.telefono`;
                      if (!validation.isValid && validation.error) {
                        setValidationErrors(prev => ({ ...prev, [errorKey]: validation.error! }));
                      } else {
                        setValidationErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors[errorKey];
                          return newErrors;
                        });
                      }
                      
                      const newSedes = [...formData.sedes];
                      newSedes[index].telefono = formattedValue;
                      setFormData({ ...formData, sedes: newSedes });
                    }}
                    placeholder="3001234567"
                    maxLength={10}
                  />
                  {validationErrors[`sedes.${index}.telefono`] && (
                    <p className="text-sm text-destructive mt-1">{validationErrors[`sedes.${index}.telefono`]}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-secondary"
                    value={sede.direccion || ''}
                    onChange={(e) => {
                      const newSedes = [...formData.sedes];
                      newSedes[index].direccion = e.target.value;
                      setFormData({ ...formData, sedes: newSedes });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nivel de Complejidad</label>
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-secondary"
                    value={sede.nivelComplejidad || ''}
                    onChange={(e) => {
                      const newSedes = [...formData.sedes];
                      newSedes[index].nivelComplejidad = e.target.value;
                      setFormData({ ...formData, sedes: newSedes });
                    }}
                  >
                    <option value="">Seleccione</option>
                    <option value="1">Nivel 1</option>
                    <option value="2">Nivel 2</option>
                    <option value="3">Nivel 3</option>
                    <option value="4">Nivel 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">N° de Camas</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`w-full px-3 py-2 border ${validationErrors[`sedes.${index}.numeroCamas`] ? 'border-destructive' : 'border-input'} bg-background rounded-lg focus:ring-2 focus:ring-secondary`}
                    value={sede.numeroCamas || ''}
                    onChange={(e) => {
                      const formattedValue = formatIntegerInput(e.target.value);
                      const validation = validateNumericField(formattedValue, 'integer');
                      
                      const errorKey = `sedes.${index}.numeroCamas`;
                      if (!validation.isValid && validation.error) {
                        setValidationErrors(prev => ({ ...prev, [errorKey]: validation.error! }));
                      } else {
                        setValidationErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors[errorKey];
                          return newErrors;
                        });
                      }
                      
                      const newSedes = [...formData.sedes];
                      newSedes[index].numeroCamas = formattedValue;
                      setFormData({ ...formData, sedes: newSedes });
                    }}
                    placeholder="Ejemplo: 10"
                  />
                  {validationErrors[`sedes.${index}.numeroCamas`] && (
                    <p className="text-sm text-destructive mt-1">{validationErrors[`sedes.${index}.numeroCamas`]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Software Asistencial</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-secondary"
                    value={sede.softwareAsistencial || ''}
                    onChange={(e) => {
                      const newSedes = [...formData.sedes];
                      newSedes[index].softwareAsistencial = e.target.value;
                      setFormData({ ...formData, sedes: newSedes });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Software Administrativo</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-secondary"
                    value={sede.softwareAdministrativo || ''}
                    onChange={(e) => {
                      const newSedes = [...formData.sedes];
                      newSedes[index].softwareAdministrativo = e.target.value;
                      setFormData({ ...formData, sedes: newSedes });
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {canAddMoreSedes && (
          <button
            onClick={() => addSedeOrService('sedes')}
            className="w-full py-2 px-4 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MapPin size={20} />
            Agregar otra sede
          </button>
        )}
      </div>
    );
  };

  const renderServiciosHabilitados = () => {
    // Get list of sede names
    const sedesConNombre = formData.sedes.filter(sede => sede.nombreSede);
    const nombresSedes = sedesConNombre.map(sede => sede.nombreSede);

    return (
      <div className="space-y-6">
        {formData.serviciosHabilitados.map((servicio, index) => (
          <div key={index} className="bg-muted/50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Servicio {index + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Nombre del Servicio Habilitado *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-accent"
                  value={servicio.nombreServicio || ''}
                  onChange={(e) => {
                    const newServicios = [...formData.serviciosHabilitados];
                    newServicios[index].nombreServicio = e.target.value;
                    setFormData({ ...formData, serviciosHabilitados: newServicios });
                  }}
                />
              </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Ambulatorio</label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-accent"
                value={servicio.ambulatorio || ''}
                onChange={(e) => {
                  const newServicios = [...formData.serviciosHabilitados];
                  newServicios[index].ambulatorio = e.target.value;
                  setFormData({ ...formData, serviciosHabilitados: newServicios });
                }}
              >
                <option value="">Seleccione</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Internación</label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-accent"
                value={servicio.internacion || ''}
                onChange={(e) => {
                  const newServicios = [...formData.serviciosHabilitados];
                  newServicios[index].internacion = e.target.value;
                  setFormData({ ...formData, serviciosHabilitados: newServicios });
                }}
              >
                <option value="">Seleccione</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
            </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Nombre de la Sede *</label>
                {nombresSedes.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-input bg-muted/50 rounded-lg text-muted-foreground text-sm">
                    Por favor, complete la sección de sedes primero
                  </div>
                ) : nombresSedes.length === 1 ? (
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-accent"
                    value={nombresSedes[0] || ''}
                    disabled
                  />
                ) : (
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-accent"
                    value={servicio.nombreSede || ''}
                    onChange={(e) => {
                      const newServicios = [...formData.serviciosHabilitados];
                      newServicios[index].nombreSede = e.target.value;
                      setFormData({ ...formData, serviciosHabilitados: newServicios });
                    }}
                  >
                    <option value="">Seleccione una sede</option>
                    {nombresSedes.map((nombreSede) => (
                      <option key={nombreSede} value={nombreSede}>{nombreSede}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => addSedeOrService('serviciosHabilitados')}
          className="w-full py-2 px-4 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition flex items-center justify-center gap-2 font-medium"
        >
          <Stethoscope size={20} />
          Agregar otro servicio
        </button>
      </div>
    );
  };

  const renderCapacidadInstalada = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">VIE Hospital</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Consultorios (Urgencias, Externa) *</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-warning"
            value={(formData.capacidadInstalada as any).consultorios || ''}
            onChange={(e) => handleInputChange('capacidadInstalada', 'consultorios', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Consultorios RIAS General</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-warning"
            value={(formData.capacidadInstalada as any).consultoriosRias || ''}
            onChange={(e) => handleInputChange('capacidadInstalada', 'consultoriosRias', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Camas de Observación/Urgencias</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-warning"
            value={(formData.capacidadInstalada as any).camasObservacion || ''}
            onChange={(e) => handleInputChange('capacidadInstalada', 'camasObservacion', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Camas Hospitalización</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-warning"
            value={(formData.capacidadInstalada as any).camasHospitalizacion || ''}
            onChange={(e) => handleInputChange('capacidadInstalada', 'camasHospitalizacion', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Camas UCI</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-warning"
            value={(formData.capacidadInstalada as any).camasUci || ''}
            onChange={(e) => handleInputChange('capacidadInstalada', 'camasUci', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Salas de Cirugía</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-warning"
            value={(formData.capacidadInstalada as any).salasCirugia || ''}
            onChange={(e) => handleInputChange('capacidadInstalada', 'salasCirugia', e.target.value)}
          />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-4">VIE Finance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Módulo Contabilidad</label>
          <select
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-warning"
            value={(formData.capacidadInstalada as any).contabilidad || ''}
            onChange={(e) => handleInputChange('capacidadInstalada', 'contabilidad', e.target.value)}
          >
            <option value="">Seleccione</option>
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Módulo Facturación</label>
          <select
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-warning"
            value={(formData.capacidadInstalada as any).facturacion || ''}
            onChange={(e) => handleInputChange('capacidadInstalada', 'facturacion', e.target.value)}
          >
            <option value="">Seleccione</option>
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-4">VIE HCM</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Número de Empleados en Nómina</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-warning"
            value={(formData.capacidadInstalada as any).empleadosNomina || ''}
            onChange={(e) => handleInputChange('capacidadInstalada', 'empleadosNomina', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Portal de Empleados</label>
          <select
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-warning"
            value={(formData.capacidadInstalada as any).portalEmpleados || ''}
            onChange={(e) => handleInputChange('capacidadInstalada', 'portalEmpleados', e.target.value)}
          >
            <option value="">Seleccione</option>
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (sections[currentSection].id) {
      case 'informacionGeneral':
        return renderInformacionGeneral();
      case 'sedes':
        return renderSedes();
      case 'serviciosHabilitados':
        return renderServiciosHabilitados();
      case 'capacidadInstalada':
        return renderCapacidadInstalada();
      default:
        return null;
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Don't render form if no user (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      {/* Achievement Notification */}
      {showAchievement && (() => {
        const AchievementIcon = showAchievement.icon;
        return (
          <div className="fixed top-4 right-4 z-50 animate-bounce-subtle">
            <div className="bg-gradient-to-r from-warning to-orange-600 text-warning-foreground p-4 rounded-xl shadow-2xl flex items-center gap-3">
              <AchievementIcon className="w-8 h-8" />
              <div>
                <p className="font-bold">¡Logro Desbloqueado!</p>
                <p className="text-sm">{showAchievement.name}</p>
                <p className="text-xs">+{showAchievement.points} puntos</p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-xl p-6 mb-6 border border-border">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Formulario de Registro
              </h1>
              {user && (
                <p className="text-sm text-muted-foreground mt-1">
                  Bienvenido, {user.email}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              {isSaving && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </div>
              )}
              {!isSaving && (
                <div className="flex items-center gap-2 text-success text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Guardado</span>
                </div>
              )}
              <div className="bg-gradient-to-r from-warning to-orange-600 text-warning-foreground px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Trophy size={20} />
                <span className="font-bold">{totalPoints} pts</span>
              </div>
              <button
                onClick={saveProgress}
                className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2 hover:shadow-lg transition transform hover:scale-105"
                disabled={isSaving}
              >
                <Save size={20} />
                Guardar
              </button>
              <button
                onClick={exportToText}
                className="bg-gradient-to-r from-success to-green-600 text-success-foreground px-4 py-2 rounded-full flex items-center gap-2 hover:shadow-lg transition transform hover:scale-105"
              >
                <Download size={20} />
                Exportar
              </button>
              
              {/* Logout Button with Confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <LogOut size={18} />
                    Cerrar Sesión
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro que deseas cerrar sesión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tus datos están guardados y podrás continuar después. No perderás ningún progreso.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut}>
                      Cerrar Sesión
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          {renderProgressBar()}
          
          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isCompleted = completedSections.includes(section.id);
              const isLocked = index > 0 && !completedSections.includes(sections[index - 1].id);
              
              return (
                <button
                  key={section.id}
                  onClick={() => !isLocked && setCurrentSection(index)}
                  disabled={isLocked}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    currentSection === index
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105`
                      : isCompleted
                      ? 'bg-success/20 text-success border border-success/30'
                      : isLocked
                      ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {isLocked ? <Lock size={18} /> : <Icon size={18} />}
                  <span>{section.name}</span>
                  {isCompleted && <CheckCircle size={16} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl shadow-xl p-6 mb-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold bg-gradient-to-r ${sections[currentSection].color} bg-clip-text text-transparent`}>
              {sections[currentSection].name}
            </h2>
            <div className="text-sm text-muted-foreground">
              Ganarás <span className="font-bold text-warning">{sections[currentSection].points} puntos</span> al completar
            </div>
          </div>
          
          {renderSectionContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => currentSection > 0 && setCurrentSection(currentSection - 1)}
            disabled={currentSection === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              currentSection === 0
                ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                : 'bg-card text-foreground hover:bg-muted shadow-md border border-border'
            }`}
          >
            <ChevronLeft size={20} />
            Anterior
          </button>
          
          <button
            onClick={completeSection}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition bg-gradient-to-r ${
              sections[currentSection].color
            } text-white hover:shadow-lg transform hover:scale-105`}
          >
            {currentSection === sections.length - 1 ? 'Finalizar' : 'Siguiente'}
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Achievements */}
        <div className="mt-8 bg-card rounded-2xl shadow-xl p-6 border border-border">
          <h3 className="text-xl font-bold mb-4 text-foreground">Logros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievementsList.map((achievement) => {
              const Icon = achievement.icon;
              const isUnlocked = achievements.includes(achievement.id);
              
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition ${
                    isUnlocked
                      ? 'border-warning bg-gradient-to-r from-warning/10 to-orange-100/50 dark:from-warning/20 dark:to-orange-600/10'
                      : 'border-border bg-muted/50 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={32} className={isUnlocked ? 'text-warning' : 'text-muted-foreground'} />
                    <div>
                      <p className="font-semibold text-foreground">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs font-bold text-warning">+{achievement.points} pts</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioClinicoGamificado;
