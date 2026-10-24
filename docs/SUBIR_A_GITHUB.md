# Subir PaleoBot a GitHub

El paquete PB-GH-01 contiene fuentes y documentación preparadas. Todavía no se ha
creado ni modificado un repositorio remoto. La cuenta, el nombre definitivo y
la visibilidad se eligen al publicarlo; no se presupone un destino existente.

## Opción recomendada: GitHub Desktop

1. Extraiga `PaleoBot_GitHub_preparado_2026-10-24.zip` en una carpeta propia.
2. Abra GitHub Desktop e inicie sesión con la cuenta que deba ser propietaria.
3. Seleccione **File > New repository** y cree un repositorio local nuevo con
   nombre sugerido `paleobot`, en una ubicación distinta de la carpeta extraída.
   Desktop crea la carpeta del repositorio dentro de la ubicación elegida.
   No añada una licencia global automática; consulte `LICENSE_STATUS.md`.
4. Copie **el contenido** de la carpeta `paleobot` extraída dentro de esa nueva
   carpeta de repositorio. Incluya la carpeta de configuración `.github`.
   Conserve el README y los archivos de configuración de esta entrega si Desktop
   creó otros predeterminados. Evite que quede una carpeta `paleobot/paleobot`.
5. Compruebe en **Changes** que aparecen la aplicación, `src`, `experimental`,
   `docs`, `scripts` y `.github`.
6. Cree el commit inicial con un mensaje como **Preparar PaleoBot para revisión
   en GitHub (PB-GH-01)**.
7. Pulse **Publish repository**, elija la cuenta/organización y mantenga marcada
   **Keep this code private** si adopta la configuración inicial propuesta.
8. Abra **View on GitHub**. Compruebe el README, el árbol de archivos y el primer
   resultado en **Actions**. Una ejecución correcta comprueba el repositorio;
   Moodle, accesibilidad manual y publicación docente siguen pendientes.

Si usa el bundle para conservar el commit preparado, puede clonar primero el
bundle y añadir esa carpeta ya inicializada con **File > Add local repository**.

## Alternativa: Git desde terminal

Después de extraer, desde la carpeta `paleobot`, en un equipo con Git instalado:

```bash
git init -b main
git add .
git commit -m "Preparar PaleoBot para revisión en GitHub (PB-GH-01)"
```

Use su identidad Git configurada. Cree en GitHub un repositorio vacío con la
visibilidad elegida y copie la URL que devuelva el servicio. Añada esa URL con
`git remote add origin URL_DEL_REPOSITORIO` y ejecute `git push -u origin main`.
`URL_DEL_REPOSITORIO` es un marcador del ejemplo; no es una dirección existente.

## Si ya existe un repositorio PaleoBot

Clone el repositorio, cree una rama de trabajo e integre los archivos revisando
las diferencias. No sobrescriba una versión existente ni fuerce el historial.
Conserve su licencia y configuración aplicables. No use el commit inicial local
como sustituto automático de otro historial. El destino debe identificarse antes
de cualquier subida asistida desde esta conversación.

## Importar el historial preparado

El archivo opcional `PaleoBot_GitHub_historial_2026-10-24.bundle` conserva el commit
local sin incluir credenciales ni remotos. Puede importarse con Git:

```bash
git clone PaleoBot_GitHub_historial_2026-10-24.bundle paleobot
```

Al clonar el bundle, Git crea un remoto `origin` que apunta al archivo local.
Cuando haya creado el repositorio vacío en GitHub y tenga su URL, sustitúyalo
con `git -C paleobot remote set-url origin URL_DEL_REPOSITORIO` y ejecute
`git -C paleobot push -u origin main`. En este caso no use `remote add origin`,
porque ese nombre ya existe. El bundle y el ZIP contienen el mismo árbol
preparado; no hace falta utilizar ambos.

## Interfaz web

GitHub documenta un límite de 100 archivos por carga y 25 MiB por archivo en la
interfaz web. Este árbol tiene más de 100 archivos, por lo que Desktop o Git
evitan dividirlo en lotes. No suba el ZIP como único archivo esperando que GitHub
lo descomprima. Si utiliza la web, extraiga y suba el contenido en lotes, incluyendo
la configuración `.github`, y compruebe el árbol al terminar.

## Activación posterior

Publicar un repositorio y activar GitHub Pages son acciones distintas. Esta
entrega no activa Pages ni configura un despliegue. La página principal v11 y
el Atlas experimental conservan sus estados de validación pendientes.

Fuentes oficiales consultadas el 24-10-2026:
- https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-a-repository-from-your-local-computer-to-github-desktop
- https://docs.github.com/en/desktop/overview/creating-your-first-repository-using-github-desktop
- https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
