# Imagen base de Node.js
FROM node:18

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Exponer el puerto en el que la app correrá
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
