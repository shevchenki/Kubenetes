FROM node:alpine
WORKDIR /app
ADD /server/ .
RUN npm install -g nodemon
RUN npm install
EXPOSE 8080
CMD ["npm", "start"]