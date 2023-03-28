FROM node:lts-alpine
#ENV NODE_ENV=production
ENV NODE_ENV=dev
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
#RUN npm install --production --silent && mv node_modules ../
RUN npm install && mv node_modules ../
RUN npm run build
RUN mkdir data
RUN mkdir data2
COPY . .
COPY ["data/data.db", "./data/data.db"]
RUN chown -R node: /usr/src/app/data/
RUN apk add python3
RUN python3 -m ensurepip
RUN pip3 install --upgrade pip
RUN pip3 install argparse  tomli
EXPOSE 3000
#USER node
CMD ["npm", "run", "dev"]
