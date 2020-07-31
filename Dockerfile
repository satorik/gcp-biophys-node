FROM gcr.io/google-appengine/nodejs
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
RUN apt-get update
RUN apt-get install -y graphicsmagick
CMD ["gm", "-version"]
RUN apt-get install -y ghostscript
CMD ["gs", "-h"]
COPY . .
CMD ["npm", "run", "build"]
CMD ["npm", "start"]