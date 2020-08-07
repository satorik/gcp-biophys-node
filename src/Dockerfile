FROM gcr.io/google-appengine/nodejs
WORKDIR '/app'
RUN apt-get update
RUN apt-get install -y graphicsmagick
CMD ["gm", "-version"]
RUN apt-get install -y ghostscript
CMD ["gs", "-h"]
COPY . .
CMD ["node", "index.js"]