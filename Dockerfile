FROM node:14

WORKDIR /app/

RUN apt-get update
RUN apt-get install nginx -y
COPY etc/nginx /etc/nginx

COPY ./ /app/

RUN npm install @angular/cli
RUN npm install
RUN npm run build-prod

RUN mkdir -p /usr/share/nginx/html/dist/
RUN cp -R ./dist/* /usr/share/nginx/html/dist/
RUN ls /usr/share/nginx/html/
RUN cd /usr/share/nginx/html/ && ln -s dist current && ln -s dist live

#RUN cp -R ./dist/* /var/www/html/

# turn off daemon
RUN echo "\ndaemon off;" >> /etc/nginx/nginx.conf

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 80
# start app
CMD ["nginx"]
