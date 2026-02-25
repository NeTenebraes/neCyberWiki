## 1. Identificar la aplicación.

![[Pasted image 20260211212904.webp]]
 Lo primero que debes hacer en todo momento es identificar ante que tipo de aplicación te estás enfrentando. En este caso, se queda evidenciado que estamos ante una "Tienda Web" con varios tipos de productos.


![[Pasted image 20260211212927.webp]]
Cada uno de los productos tiene una función llamada "check Stock" que nos permite ver el stock disponible de cada producto. 

![[Pasted image 20260213160651.webp]]
Esta funcion está implementada bajo una llamada a una API, podemos ver que la web hace la siguiente solicitud:

```http
POST /product/stock HTTP/2
Host: 0a0e00ab034b81f383025634006c007d.web-security-academy.net
Cookie: session=DK1RgDvfgPoubRsCCWjsyfoVsphy72E6
Referer: https://0a0e00ab034b81f383025634006c007d.web-security-academy.net/product?productId=7
Content-Type: application/x-www-form-urlencoded
Content-Length: 107
Origin: https://0a0e00ab034b81f383025634006c007d.web-security-academy.net
Sec-Gpc: 1
Te: trailers

stockApi=http%3A%2F%2Fstock.weliketoshop.net%3A8080%2Fproduct%2Fstock%2Fcheck%3FproductId%3D7%26storeId%3D1
```

si detallamos bien, nos daremos cuenta que es una petición POST haciendo una llamada a `stockApi` hacia la URL `http://stock.weliketoshop.net:8080/product/stock/check?productId=7&storeId=1` (Contro + U en Burp para Url encodear).

Gracias a esto, podemos entender que el servidor está "confiando" en la URL que llama la API, como sabemos, el servidor ES QUIEN ESTÁ HACIENDO esta petición. ¿que pasaría si EL SERVIDOR hace una PETICION a otra URL MAS INTERESANTE? (Por ejemplo, el panel de administrado)}

## Opciones

Lo bueno del mundo del hacking es que en si no hay un "metodo de manual" para hacer las cosas. En esta ocasión voy a optar directamente por interceptar la petición y mopdificarla directamente, aunque también puedes usar el repeater si así lo deseas.

![[Pasted image 20260213161725.webp]]

voy a modificar la petición a "127.0.0.1" que es otra forma de decir "localhost" y le voy a pasar el endpoint /admin en el intercepter. De esta forma la dale "Forward" veremos como la web me entrega el panel de administrador en lugar de la "unidades en stock"


## Jugando a ser admin

![[Pasted image 20260213161854.webp]]

Genial, si te fijas vemos el panel de administración sin siquiera tener acceso a el. Esto debido a que el servidor confia en sus propias peticiones, recordemos que al hacer "localhost" basicamente el servidor está hablando consigo mismo. 

Vemos que hay barias opciones, en este caso podemos ver que hay dos usuarios que se puede eliminar. Mandemos a la vrg al Sr carlos que es justo lo que nos piden para pasar este nivel. Pero... ¿Como lo hacemos?

## No supongas nada. 

![[Pasted image 20260213162324.webp]]

Quiza tu primer instinto sea presionar el botón "delete" que se encuentra al lado de carlos, y no te culpo yo hice exactamente lo mismo XD Pero no esto no va a funcionar, dejame te explico crack

Recuerdemos que en si, el punto vulnerable vendría siendo "StockApi". Todo lo que hagamos tiene que venir de este punto ya que descubirmos que el servidor confóa ciegamente en esta llamada. Eso quiere decir que tendremos que hacer la llamada directamente de este esta solicitud.


## Se creativo. 

Entonces ¿como diablos mandamos a la vrg al Sr Carlos? Pues facil crack, solo tiene que Copiar la llamada que se hacer al hacer click en "delete" y ponerlo en stockApi gracias al loopback vulnerable que encontramos con anterioridad. 

Por lo menos, yo lo que hice fue un simploe "clidk derecho" "copy link"

y te dará la siguiente URL: https://0a0e00ab034b81f383025634006c007d.web-security-academy.net/admin/delete?username=carlos

ahí está super boleta el /admin/delete?username=carlos. eso es justo lo que necesitamos hacer hacer nuestro payload. 

![[Pasted image 20260213162907.webp]]
Quedando el payload asi: 

stockApi=http://localhost/admin/delete?username=carlos


![[Pasted image 20260213163058.webp]]


## Reventar a carlos XD

![[Pasted image 20260213163229.webp]]
Ya lo único que quedaría seria enviar la petición y recargar la página. 

De lado del servidor veras un mensaje diciendo "FELICITACIONES" ya esto te confimaría que explotamos a carlos del server, pero si quieres confimar siempre puedes volver a ver el panel de administrador para ver los usuarios restantes, y porque no? explotar a wiener tambien xD

![[Pasted image 20260213163726.webp]]
	El server sin el carlito

![[Pasted image 20260213163812.webp]]
	A punto de explotar al wiener

![[Pasted image 20260213163904.webp]]

Nadie se salva XDXDXDD

Ya con esto tendríamos este laboratorioa requeterecontra completado, ya sabes no solo el como sui no EL PORQUE (Que es el beta mas importante aquí mano, no me sirve que solo tenga la teoria)