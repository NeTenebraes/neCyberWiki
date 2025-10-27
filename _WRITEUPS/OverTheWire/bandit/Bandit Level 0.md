---
level: Bandit 0 → Bandit 1
target: Luego de conectarse vía SSH, leer un archivo para encontrar la primera contraseña.
tags:
  - linux
  - bash
  - ctf
  - bandit
  - ssh
  - ls
  - cat
difficulty: ★☆☆☆☆
date: 2025-10-26
---
---
### Resumen
Este write-up cubre el primer paso en los wargames de "OverTheWire: Bandit", **establecer una conexión remota vía SSH** y utilizar comandos básicos de la shell de Linux (`ls`, `cat`) para encontrar y leer un archivo que contiene la contraseña para el siguiente nivel.

### Objetivo
La contraseña para el nivel `bandit1` se encuentra en un archivo llamado `readme` en el directorio `home` del usuario `bandit0`.

![[OverTheWire.bandit1.png]]

### Contexto
Este nivel establece las bases para todos los desafíos futuros. Enseña las dos acciones más fundamentales al interactuar con un sistema remoto:
1.  **Acceso Remoto**: Conectarse de forma segura a otra máquina usando el protocolo SSH.
2.  **Enumeración y Lectura Básica**: Listar los archivos en un directorio y leer el contenido de un archivo de texto.

### Aplicación en Ciberseguridad
El acceso vía SSH es el método estándar para administrar servidores de forma segura. En un pentest, obtener credenciales SSH válidas es un objetivo clave, ya que otorga al atacante un punto de entrada interactivo al sistema. Una vez dentro, los primeros comandos que se ejecutan son casi siempre `ls`, `pwd` y `cat` para realizar una enumeración básica y buscar archivos sensibles.

### Comandos y Conceptos Relevantes
* **`ssh`**: Permite iniciar una sesión de shell segura en un sistema remoto.
* **`ls`**: Lista los archivos y directorios en la ubicación actual.
* **`cat`**: Muestra el contenido de los archivos.

---

### Solución

1.  **Listar el contenido del directorio `home` para localizar el archivo.**
```
ls
```
![[OverTheWire.bandit2.png]]

2.  **Confirmar que el archivo es de texto plano (Opcional)**
```
file readme
```
![[OverTheWire.bandit3.png]]
	La entra nos da una respuesta "ASCII text" lo que nos da a entender que el mismo contiene texto.

3.  **Leer el contenido del archivo `readme` para obtener la contraseña.**
```
cat readme
```
![[OverTheWire.bandit4.png]]
	**Contraseña Censurada** por [Reglas de OverTheWire.](https://overthewire.org/rules/)

---

### Errores Comunes y Soluciones

*   **Error: No se encuentra el archivo `readme`**.
    *   **Causa**: Probablemente no estás en el directorio `home` del usuario `bandit0`.
    *   **Solución**: Regresa al directorio `home` con `cd ~` y vuelve a listar los archivos.
*   **Error: `Permission denied` al intentar conectar por SSH**.
    *   **Causa**: La contraseña fue copiada o pegada incorrectamente.
    *   **Solución**: Vuelve a mostrar el contenido del archivo `readme` y copia la contraseña con cuidado.
*   **Error: `Connection refused` o `Timeout` al conectar por SSH**.
    *   **Causa**: El puerto o el usuario son incorrectos.
    *   **Solución**: Asegúrate de usar el flag `-p 2220` y el usuario `bandit1`.

---
