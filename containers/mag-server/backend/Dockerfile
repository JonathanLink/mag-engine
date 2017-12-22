FROM node:carbon
#USER node
ENV workdir /home/node/mag-server
RUN mkdir -p ${workdir}
RUN mkdir -p /home/node/bricks
WORKDIR ${workdir}
# For production (but does not work because of proxy settings :/)
#COPY .npmrc .npmrc
#COPY package.json package.json
#RUN npm install
#RUN rm .npmrc
#COPY . .

#CMD npm start

