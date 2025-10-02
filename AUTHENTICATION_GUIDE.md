# 📋 Guía del Sistema de Autenticación - Clinic Quest

## 🎯 Descripción General

Esta aplicación cuenta con un sistema completo de autenticación y persistencia de datos que permite a los usuarios:

- ✅ Registrarse con email y contraseña
- ✅ Iniciar sesión de forma segura
- ✅ Guardar automáticamente el progreso del formulario
- ✅ Recuperar datos entre sesiones
- ✅ Cerrar sesión con confirmación

## 🔐 Características de Seguridad

### Validación de Datos
- **Email**: Formato válido, máximo 255 caracteres
- **Contraseña**: Mínimo 8 caracteres
- **Nombre completo**: Entre 2 y 100 caracteres
- Validación en tiempo real con mensajes de error claros

### Almacenamiento Seguro
- Las contraseñas se almacenan con hash (bcrypt)
- Los datos están protegidos por Row Level Security (RLS)
- Cada usuario solo puede ver y modificar sus propios datos

## 🚀 Flujo de Usuario

### 1. Primera Visita
```
Usuario abre la app → Pantalla de Login → Click "Registrarse"
```

### 2. Registro
```
Completar formulario → Validación automática → Registro exitoso → Login automático → Formulario vacío
```

### 3. Completar Formulario
```
Llenar campos → Guardado automático (cada segundo) → Indicador "Guardado" visible
```

### 4. Cerrar y Volver
```
Cerrar sesión → Confirmar → Vuelve a login → Iniciar sesión → Datos restaurados
```

## 💾 Persistencia de Datos

### Guardado Automático
- **Frecuencia**: Cada vez que cambias un campo (con debounce de 1 segundo)
- **Indicador visual**: Muestra "Guardando..." o "Guardado" en el header
- **Tecnología**: Lovable Cloud (Supabase)

### Datos Guardados
El sistema guarda automáticamente:
- ✓ Todos los campos del formulario
- ✓ Secciones completadas
- ✓ Puntos acumulados
- ✓ Logros desbloqueados
- ✓ Fecha de última actualización

### Recuperación de Datos
Al iniciar sesión, el sistema:
1. Carga automáticamente todos tus datos guardados
2. Restaura el progreso exacto donde lo dejaste
3. Muestra un mensaje de confirmación

## 🎮 Sistema de Gamificación

Los puntos y logros se guardan junto con el formulario:
- **Puntos por sección**: Se mantienen entre sesiones
- **Logros desbloqueados**: Permanecen guardados
- **Progreso visual**: Se restaura completamente

## 📱 Estructura de la Base de Datos

### Tabla `profiles`
```sql
- id: UUID (referencia a auth.users)
- nombre_completo: TEXT
- email: TEXT (único)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabla `form_data`
```sql
- id: UUID (primary key)
- user_id: UUID (referencia a auth.users, único)
- form_content: JSONB (todo el contenido del formulario)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🔒 Políticas de Seguridad (RLS)

Ambas tablas tienen Row Level Security habilitado:

```sql
-- Los usuarios solo pueden ver sus propios datos
policy "Users can view own data"
  USING (auth.uid() = user_id)

-- Los usuarios solo pueden modificar sus propios datos
policy "Users can update own data"
  USING (auth.uid() = user_id)
```

## 🎨 Interfaz de Usuario

### Página de Autenticación (`/auth`)
- Tabs para Login y Registro
- Validación en tiempo real
- Mensajes de error claros y específicos
- Estados de carga durante las operaciones

### Formulario Principal (`/`)
- **Requiere autenticación**: Redirige a `/auth` si no hay sesión
- **Header con información del usuario**: Muestra el email
- **Indicador de guardado**: "Guardando..." / "Guardado"
- **Botón de cerrar sesión**: Con diálogo de confirmación

## ⚙️ Configuración Técnica

### Auto-confirmación de Email
La aplicación está configurada para auto-confirmar emails, lo que significa:
- No se requiere verificación por correo
- Login inmediato después del registro
- Perfecto para desarrollo y testing

### Gestión de Sesiones
- Las sesiones se mantienen en localStorage
- Auto-refresh de tokens
- Redirección automática según el estado de autenticación

## 🐛 Manejo de Errores

### Errores Comunes y Soluciones

#### "Este correo ya está registrado"
**Solución**: El email ya existe, usa "Iniciar sesión" en su lugar

#### "Correo o contraseña incorrectos"
**Solución**: Verifica tus credenciales e intenta nuevamente

#### "Error al guardar los datos"
**Solución**: Revisa tu conexión a internet, los datos se intentarán guardar automáticamente

## 📊 Monitoreo

### Logs del Sistema
El sistema registra:
- Intentos de login exitosos/fallidos
- Operaciones de guardado
- Errores de red o base de datos

### Acceso a los Datos
Para ver o gestionar los datos en Lovable Cloud:
1. Ve a la sección "Cloud" en Lovable
2. Explora las tablas `profiles` y `form_data`
3. Puedes ver, editar o eliminar datos según sea necesario

## 🔄 Flujos de Autenticación

### Registro Exitoso
```
1. Usuario completa formulario de registro
2. Validación de datos (zod schema)
3. Creación de cuenta en auth.users
4. Trigger automático crea entrada en profiles
5. Login automático
6. Redirección a formulario principal
```

### Login Exitoso
```
1. Usuario ingresa credenciales
2. Validación de formato
3. Verificación en base de datos
4. Creación de sesión
5. Carga de datos del formulario
6. Redirección a formulario principal
```

### Cerrar Sesión
```
1. Click en "Cerrar Sesión"
2. Diálogo de confirmación
3. Si confirma: cierre de sesión
4. Los datos permanecen guardados
5. Redirección a /auth
```

## 🎯 Mejores Prácticas

### Para Usuarios
- ✓ No compartas tu contraseña
- ✓ Usa una contraseña segura (mínimo 8 caracteres)
- ✓ Observa el indicador "Guardado" antes de cerrar
- ✓ Cierra sesión cuando uses una computadora compartida

### Para Desarrolladores
- ✓ Los datos sensibles nunca se logean en consola
- ✓ Todas las mutaciones usan la sesión autenticada
- ✓ RLS protege datos a nivel de base de datos
- ✓ Validación tanto en cliente como servidor

## 📞 Soporte

Si encuentras algún problema:
1. Verifica tu conexión a internet
2. Cierra sesión y vuelve a iniciar
3. Revisa que los campos estén correctamente llenados
4. Contacta al administrador del sistema si el problema persiste

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0.0  
**Tecnología**: React + TypeScript + Lovable Cloud (Supabase)
