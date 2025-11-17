---
level: Bandit 11 → Bandit 12
cover:
title: "OTW Bandit: 11"
description: Te guío para encontrar la contraseña del nivel descifrando un archivo protegido con ROT13. Aprenderás no solo a aplicar y revertir este cifrado clásico desde la terminal usando el comando adecuado, sino también a profundizar en el manejo de texto y en los comandos básicos de Linux fundamentales para administración y pentesting.
tags:
  - linux
  - bash
  - bandit
  - rot13
  - cifrado
difficulty:
  - ★★☆☆☆
publishDate: 2025-11-07
---
### Resumen
[El reto de este nivel ](https://overthewire.org/wargames/bandit/bandit12.html)es encontrar la contraseña del usuario siguiente dentro del archivo `data.txt`. El archivo contiene un texto cifrado usando [ROT13](https://es.wikipedia.org/wiki/ROT13), un cifrado que rota cada letra del alfabeto 13 posiciones. **El objetivo es revertir ese cifrado para revelar la contraseña**.

### Qué es ROT13 y por qué es útil
ROT13 es una variante simple del cifrado César donde cada letra se reemplaza por la letra que está 13 posiciones adelante en el alfabeto. Como el alfabeto tiene 26 letras, aplicar ROT13 dos veces devuelve el texto original, lo que facilita su uso para ocultar información ligera. Entender ROT13 y cómo manipular texto con comandos **es interesante para la administración de sistemas y pentesting básico**.

![[OTW11.01.png]]

### Conceptos y comandos Linux clave

- `ssh`: Para acceder al servidor donde se realiza el nivel.
- `ls`: Listado de archivo en Linux.
- `cat`: Muestra el contenido de un archivo en la terminal.  
- `tr`: Comando para traducir o transformar caracteres. Recibe dos parámetros de caracteres: 
	- El primero es el de origen:  'A-Za-z'
	- El segundo el de destino para la traducción: 'N-ZA-Mn-za-m'

- La sintaxis usada para aplicar ROT13:
```
tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

Esto garantiza que cada letra original (desde `'A-Z'` y `'a-z'`) se rote un equivalente a 13 lugares. La expresión `'N-ZA-Mn-za-m'` se usa para representar el alfabeto "rotado" 13 posiciones, separado en dos rangos, porque `tr` necesita que las listas de caracteres tengan la misma longitud:

- Para mayúsculas:    
    - De la `N` a la `Z` cubre la segunda mitad del alfabeto (N, O, P, ..., Z).        
    - De la `A` a la `M` cubre la primera mitad (A, B, C, ..., M).
        
- Para minúsculas:    
    - De la `n` a la `z` es la segunda mitad de las minúsculas.        
    - De la `a` a la `m` es la primera mitad.

![[OTW11.02.webp]]

Así, cada letra en el conjunto original `'A-Za-z'`, corresponde exactamente con la letra 13 posiciones rotada. En resumen, `'N-ZA-Mn-za-m'` es la forma de escribir el alfabeto rotado 13 posiciones (ROT13) en un formato continuo que `tr` puede usar para traducir cada letra original a su equivalente cifrado correcto.

Así usando `tr 'A-Za-z' 'N-ZA-Mn-za-m'` traduces cada letra alfabética a su versión ROT13 en una sola pasada. Si no te quieres complicar mucho la cabeza recuerda que hay herramientas que hacen esto de forma automática, solo necesitas una búsqueda rapida: 

![[OTW11.03.png]]
Hay un montón en internet he incluso puede programar una para prácticar el lenguaje que gustes ya que, **suelen ser muy sencillas de hacer**. 

Aquí te dejo un par de herramientas que encontré:
- [Cryptii](https://cryptii.com/pipes/rot13-decoder)
- [dcode](https://www.dcode.fr/rot-13-cipher)

---
### Paso a paso para resolver el nivel

1. Conéctate al servidor con el usuario del nivel 11:

```
ssh bandit11@bandit.labs.overthewire.org -p 2220
```
![[OTW11.04.png]]

2. Verifica el contenido del archivo:
```
ls
cat data.txt
```
![[OTW11.05.webp]]
	Verificamos la existencia y el contenido del archivo. Aquí verás texto cifrado que no es legible.

3. Decodifica el archivo con ROT13 usando `tr` con la tubería `|` para pasar la salida de un comando como entrada de otro:

```
cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```
![[OverTheWire.bandit 7.webp]]
	Esto traduce las letras cifradas del archivo, rotándolas 13 posiciones, y muestra la contraseña original en texto claro. **Contraseña Censurada** por [Reglas de OverTheWire.](https://overthewire.org/rules/)
### Por qué usar tuberías "|"

Las tuberías permiten combinar comandos para procesar datos sin crear archivos temporales, haciendo que la manipulación sea rápida y eficiente.

---
### Ejemplo simple para entender ROT13 con tr

Si quieres probar en la terminal:
```
echo Hola | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```
	Recibirás la salida: Ubyn

Si vuelves a aplicar el comando pero con la palabra `Ubyn`, recibirás `Hola` como resultado.

El comando `tr` es muy flexible y permite muchas otras transformaciones distintas. Algunos ejemplos comunes son:

- Convertir todas las letras minúsculas a mayúsculas: ` tr 'a-z' 'A-Z'`
- Rotar números 5 posiciones (ROT5):  `tr '0-9' '5-90-4'`
- Eliminar caracteres, por ejemplo borrar todas las 'a':  `tr -d 'a'`
- Comprimir múltiples espacios seguidos en uno solo:  `tr -s ' '`
- ROT47, que rota un rango amplio de caracteres imprimibles:  `tr '\!-~' 'P-~\!-O'`

Puedes crear cualquier par de conjuntos para traducir, **siempre que tengan la misma longitud**. Esto hace que `tr` sea muy útil para manipular y transformar texto de muchas formas.