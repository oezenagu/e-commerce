FROM nginx:alpine

COPY . /usr/share/nginx/html

EXPOSE 95

CMD ["nginx", "-g", "daemon off;"]
