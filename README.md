# TroncalTrack Cargas

"Create a clean, highly professional logistics load board platform for South America named TroncalTrack, visually and functionally inspired by Truckstop Go.

CRITICAL LANGUAGE RULE: All visible text, labels, buttons, placeholders, menus, and UI components MUST BE 100% IN SPANISH (Chilean regional context for truckers and shipping companies).

1. VISUAL DESIGN & COLOR PALETTE (Truckstop Aesthetic):

Background: Pure crisp white (#FFFFFF) with light gray background areas (#F8F9FA) for contrast.

Typography & Text: Very crisp, high-contrast dark text (#111827) for extreme legibility on mobile and desktop.

Accent Color: Vibrant Truckstop Red (#DC2626) for primary Action Buttons (CTA), active status badges, and key metrics.

Borders & Cards: Thin subtle gray borders (#E5E7EB) around clear white cards with soft shadows.

2. CORE APP STRUCTURE & NAVIGATION (In Spanish):

Header/Navbar: Top clean bar with TroncalTrack logo, a clear Role Switcher ('Soy Camionero' / 'Soy Empresa / Cargador'), and primary buttons: 'Iniciar Sesión' and 'Registrate Gratis'.

Role-Based Views:

Modo Camionero: Focuses on finding loads ('Buscar Cargas') and posting truck availability ('Publicar mi Camión').

Modo Empresa: Focuses on posting loads ('Publicar Flete') and searching available trucks ('Buscar Camiones').

3. MAIN LOAD BOARD (The Truckstop Core Screen):

Top Search & Filter Bar: Simple inputs for 'Origen' (e.g. Los Ángeles), 'Destino' (e.g. Angol), 'Tipo de Carrocería' ('Rampla Plana', 'Tolva', 'Furgón', 'Thermo / Frigo', 'Sider', 'Cama Baja'), and 'Fecha'.

Load List Cards (Cards Design in Spanish): Clean vertical list of available loads showing:

Origen $\rightarrow$ Destino in bold text with distance in km (e.g., 'Los Ángeles $\rightarrow$ Santiago (510 km)').

Valor por Kilómetro ($/km) prominently highlighted next to the Total Price in CLP (e.g., '$1.200 / km - Total: $612.000 CLP').

Tipo de Equipamiento y Capacidad (e.g., 'Rampla Plana - 28 Toneladas').

Verification Badge: Green checkmark badge saying 'Empresa Verificada'.

Action Button: Solid Red button saying 'Contactar / Llamar' or 'Ver Detalles'.

4. KEY FUNCTIONALITIES TO INCLUDE (In Spanish):

'Publicar mi Camión' (Post a Truck): A simple modal/form where truckers can publish their availability (e.g., 'Tengo camión de 10 Ton Thermo disponible para ir de Los Ángeles a Santiago').

Free Model & Verification System: Display a banner stating 'TroncalTrack es 100% Gratis durante nuestro lanzamiento regional' with a discrete 'Apoyar el proyecto / Donaciones' button.

Auth UI: Simple, fully functional login/register modal separating Trucker and Company accounts, including a clear '¿Olvidaste tu contraseña?' recovery flow.

Keep the code modular, simple, clean, and responsive for mobile phones."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/140508ef-45d3-44ca-ac8a-56c6d35e74f1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
