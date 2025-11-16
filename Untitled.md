## Conexiones TCP

**El protocolo TCP es una forma ordenada de enviar datos** entre dos equipos en la red por medio del **three‑way handshake**, pero para no entrar en tecnicismos, puedes imaginarlo como una llamada telefónica: los equipos primero se saludan, luego se comunican entre sí y al final cuelgan la conexión. 

Mientras la conexión está abierta, **TCP se encarga de que todo llegue completo y en el orden correcto**, reenviando lo que se pierda por el camino. Al terminar, la conexión se cierra de forma ordenada para que ninguna de las dos partes se quede esperando datos.

### Three‑way handshake

Antes de enviar datos por TCP, los dos equipos se mandan tres mensajes rápidos para abrir la conexión, como cuando saludas antes de empezar a hablar. 

1. Tu máquina envía un mensaje al servidor diciendo: “¿Estás ahí? Quiero hablar” (SYN). 
2. El servidor responde: “Sí, estoy aquí y también quiero hablar” (SYN‑ACK).
3. Tu máquina contesta: “Perfecto, empecemos” (ACK). 

A esta secuencia de tres pasos se le llama three‑way handshake y, cuando termina, ya pueden empezar a intercambiar datos por TCP de forma normal.
