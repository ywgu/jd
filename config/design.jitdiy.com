server {
    listen 443 ssl;
    server_name design.jitdiy.com;
    root /var/www/jitdiy/code/public;

    ssl on;
    gzip on;

    ssl_certificate /etc/letsencrypt/live/design.jitdiy.com/cert.pem;
    ssl_certificate_key /etc/letsencrypt/live/design.jitdiy.com/privkey.pem;

    #ssl_stapling on;
    #ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/design.jitdiy.com/fullchain.pem;

    ssl_session_timeout 5m;

    # let nginx handle the static resources
    #location ~ ^/(htm/|html/|images/|img/|javascript/|js/|css/|stylesheets/|flash/|media/|static/|robots.txt|humans.txt|favicon.ico) {
    #  root /var/www/jitdiy/code/public;
    #  access_log on;
    #  expires @30m;
    #}
    location / {
        try_files $uri $uri/ @nodejs;
    }
    location @nodejs {
        proxy_pass https://127.0.0.1:3000;
    #    proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}

server {
    listen 80;
    server_name design.jitdiy.com;
    root /var/www/jitdiy/code/public;
}
