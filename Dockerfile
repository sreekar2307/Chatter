FROM node
COPY yarn.lock package.json ./
RUN yarn install
COPY . ./
EXPOSE 4000
CMD ["npm", "start"]
