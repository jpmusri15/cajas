# Cajas de Sucursales

Web app para iPhone (se instala desde Safari → Compartir → Agregar a pantalla de inicio).

- `index.html`: la app.
- `firebase-config.js`: configuración de Firebase (pegar la del proyecto).
- `sw.js`: permite abrirla sin conexión.
- `manifest.webmanifest` e `icons/`: ícono y nombre en la pantalla de inicio.

Reglas de Firestore (Consola de Firebase → Firestore Database → Reglas):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.email == "jpmusri15@gmail.com";
    }
  }
}
```

## Mi ayuda memoria (`/memoria`)

Segunda app en el mismo sitio: notas del día y temas, cargados por voz.
Se abre en https://jpmusri15.github.io/cajas/memoria/ y usa el mismo Firebase y la misma cuenta
(colección `memoria` en Firestore; las reglas de arriba ya la cubren).
