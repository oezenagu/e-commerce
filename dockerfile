FROM nginx:alpine

COPY . /usr/share/nginx/html

EXPOSE 2000

CMD ["nginx", "-g", "daemon off;"]
