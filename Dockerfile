# Используем официальный Node.js образ в качестве базового
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем остальные файлы приложения
COPY . .

# Компилируем TypeScript код
RUN npm run build

# Указываем команду запуска контейнера
CMD ["npm", "run", "start:prod"]

# Открываем порт, на котором будет работать приложение
EXPOSE 3000