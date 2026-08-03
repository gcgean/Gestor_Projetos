# Deploy em `projetos.baselider.com.br`

O DNS deve apontar `projetos.baselider.com.br` para `154.53.48.79` com proxy Cloudflare ativo.

## 1. Preparar o servidor

```bash
mkdir -p /opt/gestor_projetos
cd /opt/gestor_projetos
```

Copie o projeto para essa pasta e crie o ambiente:

```bash
cp .env.production.example .env.production
nano .env.production
```

Troque obrigatoriamente `POSTGRES_PASSWORD` e `JWT_SECRET` por valores fortes e únicos.

## 2. Subir a aplicação

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

O container web ficará acessível somente no servidor em `127.0.0.1:8787`, evitando conflito com os outros sites.

## 3. Proxy reverso do servidor

Instale `projetos.baselider.com.br.conf` em `/etc/nginx/sites-available/`, crie o link em `sites-enabled` e coloque o certificado Origin da Cloudflare em:

```text
/etc/ssl/cloudflare/projetos.baselider.com.br.pem
/etc/ssl/cloudflare/projetos.baselider.com.br.key
```

Depois valide e recarregue o Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

No Cloudflare, use SSL/TLS em `Full (strict)`.

## 4. Testes

```bash
curl -I https://projetos.baselider.com.br
curl https://projetos.baselider.com.br/api/health
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
```
