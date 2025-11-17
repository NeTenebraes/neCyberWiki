---
title: "OTW Bandit: 6"
cover:
description:
tags:
  - linux
  - bash
  - ctf
  - bandit
  - find
  - file-attributes
  - permissions
  - size
difficulty:
  - ★☆☆☆☆
publishDate: 2025-10-29
---
### Resumen
Este write-up explica cómo buscar un archivo basado en atributos específicos: propietario usuario y grupo, y tamaño exacto. Se utiliza el comando `find` combinando múltiples filtros para aislar el archivo deseado, que contiene la contraseña para avanzar al siguiente nivel.

### Objetivo
Encontrar el archivo en el sistema que cumpla con estas propiedades:
1. Propietario usuario `bandit7`.
2. Propietario grupo `bandit6`.
3. Tamaño de 33 bytes.

### Contexto
Este nivel fomenta la habilidad de búsqueda avanzada en Linux usando `find`, combinando varios criterios para localizar archivos en sistemas con múltiples niveles y permisos variados. Herramientas como `find` son esenciales en análisis forense y gestión de seguridad para localizar archivos por metadatos clave, como propietario o tamaño, lo que ayuda a detectar evidencia o configuraciones específicas en investigaciones.

### Comandos y Conceptos Relevantes
* **`find`**: Busca archivos/directorios en el sistema.
  * `-user bandit7`: Filtra por propietario usuario.
  * `-group bandit6`: Filtra por grupo propietario.
  * `-size 33c`: Selecciona archivos de tamaño exacto 33 bytes (`c` indica bytes).
* **Redirección `2>/dev/null`**: Oculta errores de permisos para una salida limpia.

---

### Solución

1. **Conectar al servidor como `bandit6`**
```
ssh bandit6@bandit.labs.overthewire.org -p 2220
```
![[OTW06.01.webp]]

2. **Buscar el archivo con las propiedades específicas**  

```
find / -user bandit7 -group bandit6 -size 33c 2>/dev/null
```
![[OTW06.02.webp]]
	Este comando busca en todo el sistema el archivo con propietario "`bandit7`", grupo "`bandit6`" y tamaño 33 bytes, ignorando mensajes de error por permisos. La herramienta nos da como resultado: `/var/lib/dpkg/info/bandit7.password`.

3. **Leer el contenido del archivo encontrado**  
```
cat /var/lib/dpkg/info/bandit7.password
```
![[OTW06.03.webp]]
	Se muestra la contraseña necesaria para avanzar al siguiente nivel. **Contraseña Censurada** por [Reglas de OverTheWire.](https://overthewire.org/rules/)

---

### TIPS
* Usa redirección de errores para evitar interrupciones visuales por falta de permisos.
* Construye comandos `find` específicos para no generar búsquedas largas y lentas.
  
### Errores Comunes y Soluciones
* **No encontrar el archivo**: Verifica que los filtros sean exactos y recuerda usar `c` para que el tamaño sea en bytes.
* **Errores por permisos denegados**: Usa `2>/dev/null` para ocultar esos mensajes.

### Recursos para Profundizar
* `man find`: Manual del comando find.
* [Tutorial Find Command (Linux Handbook)](https://linuxhandbook.com/find-command/)

