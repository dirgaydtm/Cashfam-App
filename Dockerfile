FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev libzip-dev nodejs npm \
    && docker-php-ext-install pdo_mysql zip gd \
    && a2enmod rewrite

WORKDIR /var/www/html

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy composer files and artisan
COPY composer.json composer.lock* package.json artisan ./
COPY app/ ./app/
COPY bootstrap/ ./bootstrap/
COPY config/ ./config/

# Install dependencies
RUN composer install --no-dev --optimize-autoloader
RUN npm install

# Copy rest of the app
COPY . .

# Build assets
RUN npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 storage bootstrap/cache

# Configure Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

EXPOSE 80

CMD ["bash", "-c", "php artisan key:generate --force && php artisan migrate --force && apache2-foreground"]
