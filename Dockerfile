FROM node:18-alpine

WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

RUN chmod +x start.sh
CMD ["./start.sh"]
EXPOSE 3002
