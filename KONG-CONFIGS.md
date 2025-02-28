https://github.com/Kong/docker-kong/tree/master/compose


https://github.com/Kong/kong-oauth2-hello-world/blob/master/README.md



### Gateway Services

criação usando curl:  
```sh
curl -X POST \
  --url "http://127.0.0.1:8001/services" \
  --data "name=users-service" \
  --data "url=http://mockbin.org/request"
```

representação em json do Gateway Services no Dashboard do Kong:  
```json
{
  "name": "users-service",
  "tags": null,
  "protocol": "http",
  "path": "/users",
  "read_timeout": 60000,
  "retries": 5,
  "host": "eletron",
  "connect_timeout": 60000,
  "tls_verify_value": false,
  "tls_verify_enabled": false,
  "ca_certificates": null,
  "client_certificate": null,
  "write_timeout": 60000,
  "port": 8600
}
```


### Routes

curl -X POST \
  --url "http://127.0.0.1:8001/services/users-service/routes" \
  --data 'hosts[]=mockbin.org' \
  --data 'paths[]=/users'


{
  "name": "users-route",
  "protocols": [
    "http",
    "https"
  ],
  "https_redirect_status_code": 426,
  "strip_path": true,
  "preserve_host": false,
  "request_buffering": true,
  "response_buffering": true,
  "tags": [],
  "service": {
    "id": "6b624a02-1537-4f07-a5bb-eab32d4438e3"
  },
  "methods": null,
  "hosts": [
    "eletron"
  ],
  "paths": [
    "/users"
  ],
  "headers": null,
  "regex_priority": 0,
  "path_handling": "v0",
  "sources": null,
  "destinations": null,
  "snis": null
}

### Consumer

curl -X POST \
  --url "http://127.0.0.1:8001/consumers/" \
  --data "username=thefosk"


{
  "username": "thefork",
  "custom_id": null,
  "tags": []
}

### Credentials

curl -X POST \
  --url "http://127.0.0.1:8001/consumers/thefosk/oauth2/" \
  --data "name=Hello World App" \
  --data "redirect_uris[]=http://konghq.com/"


{
  "client_id": "eL6jViy2830HkzLu9i32tewQ7IqvhWrx",
  "client_secret": "2axXyIJw57bgxIjnBCvFFIRucZbs7ayD",
  "client_type": "confidential",
  "consumer": {
    "id": "868d277c-137a-4bfc-ac13-cde25f4da1c8"
  },
  "hash_secret": false,
  "name": "Hey Word App",
  "redirect_uris": [
    "http://localhost:3000/authorized",
    "http://localhost:3000/mock",
    "https://localhost:3443/authorized",
    "https://localhost:3443/mock"
  ],
  "id": "2a493c2f-8704-4dab-8a2f-f15a9080237a"
}

### Oauth2

curl -X POST \
  --url http://127.0.0.1:8001/services/users-service/plugins/ \
  --data "name=oauth2" \
  --data "config.scopes=email, phone, address" \
  --data "config.mandatory_scope=true" \
  --data "config.enable_authorization_code=true"

{
  "name": "oauth2",
  "enabled": true,
  "service": {
    "id": "6b624a02-1537-4f07-a5bb-eab32d4438e3"
  },
  "route": {
    "id": "24af0597-1fa0-452d-b110-83961ae4f62d"
  },
  "protocols": [
    "grpc",
    "grpcs",
    "http",
    "https"
  ],
  "instance_name": "oauth2",
  "config": {
    "accept_http_if_already_terminated": false,
    "auth_header_name": "authorization",
    "enable_authorization_code": true,
    "enable_client_credentials": true,
    "enable_implicit_grant": false,
    "enable_password_grant": false,
    "global_credentials": false,
    "hide_credentials": false,
    "mandatory_scope": false,
    "pkce": "lax",
    "provision_key": "VuVKqnYiYBKDyMmrzNa3jsm5CIdfcR3Y",
    "refresh_token_ttl": 1209600,
    "reuse_refresh_token": false,
    "token_expiration": 7200
  }
}