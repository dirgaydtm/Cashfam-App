FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev libzip-dev nodejs npm \
    && docker-php-ext-install pdo_mysql zip gd \
    && a2enmod rewrite

WORKDIR /var/www/html

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy all files first
COPY . .

# Install dependencies without scripts first
RUN composer install --no-dev --no-scripts --optimize-autoloader

# Run package discovery manually
RUN php artisan package:discover --ansi || true

# Install npm and build
RUN npm install
RUN npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 storage bootstrap/cache

# Configure Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

EXPOSE 80

CMD ["bash", "-c", "php artisan key:generate --force && php artisan migrate --force && apache2-foreground"]
