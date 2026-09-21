# Demo Admin Credentials

The protected demo admin account is:

- Email: `admin@deshparcel.com`
- Password: set through the `ADMIN_PASSWORD` environment variable

The seed command creates or updates this account:

```text
npm run seed
```

Do not commit the demo password or any production secret. Use a dedicated evaluator password in the deployment environment and share it privately with the evaluator.