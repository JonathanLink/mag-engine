FROM node:carbon
#USER node # not good to comment (this for security reason)
ENV workdir /home/node/mag-engine
RUN mkdir -p ${workdir}
WORKDIR ${workdir}
# For production (but does not work because of proxy settings :/)
#COPY .npmrc .npmrc
#COPY package.json package.json
#RUN npm install
#RUN rm .npmrc
#COPY . .

CMD npm start

