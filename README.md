# TRECK - Frontend

**TRECK** - Plataforma integral de educación y conciencia en ciberseguridad.

**T**ecnología · **R**iesgo · **E**ducación · **C**onciencia · **K**now-how

Frontend web moderno para la plataforma de entrenamiento en detección de phishing e ingeniería social, desarrollado en React con Next.js 15 y TypeScript.

## Descripción General

TRECK Frontend proporciona una experiencia interactiva y responsiva que combina tecnología, evaluación de riesgos y educación pedagógica para desarrollar conciencia sobre ciberseguridad.

Los usuarios pueden:

- 📚 **Completar lecciones de capacitación** sobre phishing e ingeniería social
- 🎯 **Responder simulaciones realistas** de ataques generados por IA
- ✅ **Tomar evaluaciones** para medir competencias en detección de fraude
- 📊 **Visualizar progreso** en tiempo real con métricas dinámicas
- 👤 **Gestionar perfil** y cambiar contraseña

## Características Principales

- 🎨 **Interfaz moderna**: Diseño limpio con Tailwind CSS
- 📱 **Responsivo**: Funciona en desktop, tablet y móvil
- ⚡ **Rápido**: Next.js con optimizaciones de rendimiento
- 🔐 **Seguro**: JWT para autenticación
- 📊 **Dashboards dinámicos**: Progreso actualizado en tiempo real (1/3 cada módulo)
- 🇵🇾 **Localización**: Interfaz en español

## Requisitos Previos

- Node.js 18+
- Backend TRECK en http://localhost:8000
- npm o pnpm

## Instalación

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd treck-front-end

# 2. Instalar dependencias
npm install

# 3. Crear .env.local con:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_ENVIRONMENT=development
```

## Ejecución

```bash
# Servidor de desarrollo
npm run dev
# Abrir http://localhost:3000

# Build para producción
npm run build
npm run start

# Tests
npm run test
```

## Componentes Principales

| Componente | Ruta | Descripción |
|-----------|------|-------------|
| Dashboard | `/` | Panel principal |
| Capacitaciones | `/capacitaciones` | Lecciones secuenciales |
| Simulaciones | `/simulaciones` | Ataques realistas |
| Evaluaciones | `/evaluaciones` | Ejercicios interactivos |
| Mi Progreso | `/progreso` | Métricas en tiempo real |
| Mi Perfil | `/perfil` | Gestión de cuenta |

## Cálculo de Progreso

El progreso se calcula dinámicamente desde el backend:

```
Progreso General = (P_Capacitacion + P_Simulaciones + P_Evaluaciones) / 3
```

Cada módulo contribuye **1/3** del progreso total, capped a 100% máximo.

## Endpoints de API Utilizados

```
POST   /api/users/auth/login/
POST   /api/users/auth/register/
GET    /api/users/mi-progreso/              # Progreso dinámico
GET    /api/capacitaciones/lecciones/
POST   /api/capacitaciones/lecciones/{id}/marcar_completada/
GET    /api/simulaciones/
POST   /api/simulaciones/registrar-respuesta/
GET    /api/evaluaciones/
POST   /api/evaluaciones/responder/
```

## Estructura

```
treck-front-end/
├── app/                 # Páginas (App Router)
├── components/          # Componentes React
├── lib/                # Helpers y API
├── styles/             # CSS global
├── public/             # Assets estáticos
└── package.json
```

## Desarrollo

```bash
# Nuevo componente
# components/nuevo-componente.tsx

# Nueva página
# app/nueva-pagina/page.tsx

# Nuevas funciones API
# lib/nueva-api.ts
```

## Troubleshooting

**Error: "Cannot connect to API"**
- Verificar que backend está en puerto 8000
- Verificar NEXT_PUBLIC_API_URL en .env.local

**Error: "Token inválido"**
- Limpiar localStorage: localStorage.clear()
- Ir a login nuevamente

## Licencia

Proyecto Final de Grado - Universidad Católica Nuestra Señora de la Asunción - Campus Guairá

## Contacto

- Autor: Federico Traversi
- Email: federico.traversi@uc.edu.py
