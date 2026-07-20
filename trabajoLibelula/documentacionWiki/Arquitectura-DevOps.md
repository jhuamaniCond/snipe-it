
## 6.1 Docker

El proyecto incluye:

- Dockerfile
- Docker Compose
- Imágenes Ubuntu y Alpine

### Servicios principales

- Aplicación PHP/Laravel
- MariaDB

---

## 6.2 Variables de Entorno

Configuración basada en:

```text
.env
```

Incluye:

- APP_ENV
- DB_CONNECTION
- MAIL_HOST
- CACHE_DRIVER
- API_THROTTLE
- SAML
- LDAP

---

## 6.3 PHPUnit

Configuración principal:

```xml
<testsuites>
  <testsuite name="Unit"/>
  <testsuite name="Feature"/>
</testsuites>
```

Características:

- SQLite in-memory
- Factories
- Mocking
- Testing automatizado

---

## 6.4 GitHub Actions

Pipelines principales:

| Workflow | Función |
|---|---|
| tests-mysql | Testing MySQL |
| tests-postgres | Testing PostgreSQL |
| tests-sqlite | Testing SQLite |
| docker-ubuntu | Build Docker |
| codeql | Seguridad |

---
