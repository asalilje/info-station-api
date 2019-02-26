FROM arm32v7/node 
WORKDIR app
COPY package.json .
RUN npm install
COPY server.js .
CMD ["npm", "start"]