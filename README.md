# La Gracia de Dios · Punto de Venta (demo)

Demo interactiva de un sistema POS para **La Gracia de Dios**, restaurante de comidas rápidas con sabor costeño en Cartagena de Indias. Nació como complemento visual del proyecto de aula *Estrategias de Innovación Organizacional para el Fortalecimiento Competitivo del Restaurante La Gracia de Dios en Cartagena*.

**Demo en vivo:** `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/` (reemplaza con tu URL al publicar).

> Es una maqueta: todos los datos (productos, precios, clientes, pedidos) son **de ejemplo** y viven en la memoria del navegador. Al recargar la página vuelve al estado inicial.

## Qué muestra

| Pantalla | Qué resuelve del diagnóstico |
|---|---|
| **Venta** | Toma de pedidos por mesa, para llevar o domicilio (WhatsApp / app), notas por producto y cobro en efectivo, tarjeta o transferencia. Pide repetir el pedido al cliente antes de enviarlo (protocolo de toma de pedidos). |
| **Cocina** | Comandas numeradas con cronómetro frente a la meta de servicio, en lugar del pedido verbal. |
| **Pedidos** | Estado, cobro pendiente y registro de errores de comanda. |
| **Inventario** | Descuento automático por venta, mínimos por insumo y registro de entradas y salidas. |
| **Costeo** | Costo y margen por plato a partir de la receta, con precio sugerido según el margen objetivo. |
| **Clientes** | Tarjeta de 8 sellos con beneficio, y autorización de datos (Ley 1581 de 2012). |
| **Indicadores** | Ventas, tiempo de servicio, errores por 100 comandas, margen, satisfacción y canal digital. |

El selector de rol (Propietario, Cajero, Cocina) cambia las pantallas disponibles. El botón de reinicio restaura los datos.

## Ejecutarla en local

Es un sitio estático (HTML, CSS y JavaScript sin dependencias ni paso de compilación). Abre `index.html` o, mejor, sirve la carpeta:

```bash
python -m http.server 8080
```

y entra a `http://localhost:8080`.

## Publicarla con GitHub Pages

1. Crea un repositorio público en GitHub y sube el contenido de esta carpeta a la rama `main`.
2. En el repositorio: **Settings → Pages → Build and deployment**.
3. En *Source* elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
4. En uno o dos minutos la página queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

Todas las rutas son relativas, por lo que funciona bajo el subdirectorio del repositorio sin cambios. El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

## Personalizar el menú

Los productos, insumos, recetas y precios están en [`data.js`](data.js). El proyecto de aula no incluye la carta del local, así que el menú es una propuesta coherente con el documento (público local y turístico, proveedores de plazas de mercado y pescadores, gasto por persona de $25.000 a $50.000). Reemplázalo por la carta real: cada producto lleva su receta (`r`), y de ahí salen el costo, el margen y el descuento de inventario.

## Estructura

```
index.html   Estructura de la página
styles.css   Estilos y diseño responsivo (teléfono, tablet y escritorio)
data.js      Menú, insumos y recetas de ejemplo
app.js       Lógica de la aplicación
favicon.svg  Ícono
```
