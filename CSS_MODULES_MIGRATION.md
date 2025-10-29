# Migración a CSS Modules

Este proyecto ha sido migrado de Tailwind CSS a CSS Modules para mayor control y mejor rendimiento.

## Estructura de Estilos

### Archivos CSS Modules Creados:

1. **`styles/components.module.css`** - Componentes reutilizables (botones, inputs, cards)
2. **`styles/layout.module.css`** - Utilidades de layout (flex, grid, spacing)
3. **`styles/utils.module.css`** - Clases utilitarias (colores, texto, spacing)
4. **`app/globals.css`** - Estilos globales y variables CSS

### Variables CSS Disponibles:

```css
:root {
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;
  
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;
  
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-900: #111827;
}
```

## Cómo Usar CSS Modules

### Importar estilos:
```tsx
import styles from './Component.module.css';
import utils from '@/styles/utils.module.css';
import components from '@/styles/components.module.css';
```

### Aplicar clases:
```tsx
// Clase única
<div className={styles.container}>

// Múltiples clases
<div className={`${styles.card} ${utils.p4} ${utils.shadow}`}>

// Clases condicionales
<div className={`${styles.button} ${isActive ? styles.active : ''}`}>
```

## Componentes Convertidos

### ✅ Completados:
- `app/page.tsx` - Página principal
- `components/LoadingSpinner.tsx` - Spinner de carga

### 🔄 En progreso:
- Resto de páginas y componentes

## Beneficios de CSS Modules

1. **Scoped CSS** - Los estilos están encapsulados por componente
2. **Mejor rendimiento** - Solo se cargan los estilos necesarios
3. **Type safety** - Autocompletado de clases CSS en TypeScript
4. **Menor bundle size** - Sin framework CSS externo
5. **Mayor control** - Estilos personalizados sin limitaciones

## Migración de Tailwind a CSS Modules

### Antes (Tailwind):
```tsx
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
  <button className="btn btn-primary px-4 py-2 rounded-lg">
    Click me
  </button>
</div>
```

### Después (CSS Modules):
```tsx
<div className={components.card}>
  <button className={`${components.btn} ${components.btnPrimary}`}>
    Click me
  </button>
</div>
```

## Comandos de Build

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start
```

El proyecto mantiene exactamente los mismos estilos visuales pero ahora usa CSS Modules para mejor rendimiento y mantenibilidad.