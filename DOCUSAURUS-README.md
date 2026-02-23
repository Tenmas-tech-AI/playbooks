# Tenmás AI Playbooks - Documentación Docusaurus

## 📚 ¿Qué es esto?

Este es un proyecto de **Docusaurus** con toda la documentación técnica para los desarrolladores de Tenmás trabajando en el proyecto AI-Native.

## 🚀 Cómo usar

### Opción 1: Ver el proyecto completo (Recomendado)

El proyecto está en: `/home/claude/tenmas-ai-playbooks`

```bash
# 1. Ir a la carpeta
cd /home/claude/tenmas-ai-playbooks

# 2. Iniciar el servidor de desarrollo
npm start

# 3. Abrir en el browser: http://localhost:3000
```

### Opción 2: Descargar y usar en tu máquina

```bash
# 1. Copiar carpeta (sin node_modules para que sea más ligera)
cp -r /home/claude/tenmas-ai-playbooks ~/mi-copia
cd ~/mi-copia
rm -rf node_modules

# 2. Instalar dependencias
npm install

# 3. Iniciar
npm start
```

## 📁 Estructura Actual

```
tenmas-ai-playbooks/
├── docs/
│   ├── introduccion/
│   │   ├── overview.md ✅ COMPLETO
│   │   ├── objetivos.md ✅ COMPLETO
│   │   └── stack-tecnico.md ✅ COMPLETO
│   ├── semana-1-2/
│   │   ├── resumen.md ✅ COMPLETO
│   │   └── dia-01-cursor-coderabbit.md ✅ COMPLETO (guía detallada)
│   ├── playbooks/
│   │   └── coding/ (a completar en Día 8-9)
│   ├── herramientas/ (a completar)
│   ├── metricas/ (a completar)
│   └── recursos/ (a completar)
├── docusaurus.config.ts ✅ Personalizado para Tenmás
├── sidebars.ts ✅ Estructura completa definida
└── package.json
```

## ✅ Lo que YA está hecho

1. **Configuración personalizada de Docusaurus**
   - Título: "Tenmás AI Playbooks"
   - Idioma: Español
   - Tema: Dark/Light mode
   - Búsqueda integrada

2. **Estructura completa de navegación**
   - Sidebar con todas las secciones
   - Links entre páginas
   - Categorías organizadas

3. **Contenido inicial:**
   - ✅ Introducción completa (3 páginas)
   - ✅ Resumen del plan Semanas 1-2
   - ✅ Día 1 completo con guía detallada (5h de contenido)

## 📝 Lo que falta completar

### Prioridad Alta (Días 2-10)
- [ ] Día 2: GitHub Security + PromptLayer
- [ ] Día 3: Make.com + Playwright
- [ ] Día 4: LangChain
- [ ] Día 5: Grafana + Métricas
- [ ] Día 6: Docusaurus Setup
- [ ] Día 7: Docusaurus Deploy
- [ ] Día 8-9: Coding Playbook (contenido principal)
- [ ] Día 10: Quality Gates

### Prioridad Media (Playbooks)
- [ ] Coding Playbook completo
- [ ] Debugging Playbook
- [ ] Documentation Playbook
- [ ] Testing Playbook

### Prioridad Baja (Referencia)
- [ ] Documentación detallada de cada herramienta
- [ ] FAQ extendido
- [ ] Troubleshooting completo
- [ ] Glosario de términos

## 🎨 Personalización

### Cambiar colores/tema:

Edita: `src/css/custom.css`

### Cambiar logo:

Reemplaza: `static/img/logo.svg` con logo de Tenmás

### Agregar nueva página:

```bash
# 1. Crear archivo .md en docs/
echo "# Mi Nueva Página" > docs/mi-pagina.md

# 2. Agregar a sidebars.ts si quieres que aparezca en el menu
```

## 🚀 Deploy

Cuando esté listo para publicar:

### Opción A: Vercel (Recomendado - Gratis)

```bash
npm install -g vercel
vercel
```

### Opción B: Netlify (Gratis)

```bash
npm run build
# Subir carpeta 'build/' a Netlify
```

### Opción C: GitHub Pages

```bash
# Configurar en docusaurus.config.ts:
# organizationName: 'tenmas'
# projectName: 'ai-playbooks'

npm run deploy
```

## 📚 Recursos

- **Docusaurus Docs:** https://docusaurus.io/docs
- **Markdown Guide:** https://www.markdownguide.org/
- **Template usado:** Classic preset

## 🆘 Ayuda

Si tienes problemas:

1. Verifica que Node.js esté instalado: `node --version`
2. Borra node_modules y reinstala: `rm -rf node_modules && npm install`
3. Revisa la consola del browser para errores
4. Consulta la documentación de Docusaurus

---

## 🎯 Próximos Pasos Recomendados

1. **Ejecutar el proyecto:** `npm start` y ver cómo se ve
2. **Revisar el Día 1:** docs/semana-1-2/dia-01-cursor-coderabbit.md
3. **Completar Días 2-10:** Usar el Día 1 como template
4. **Agregar screenshots:** En static/img/
5. **Completar playbooks:** A medida que los defines en real

---

**Creado por:** Linder Hassinger - AI Tech Lead  
**Fecha:** Febrero 2026  
**Versión:** 1.0.0
