# Anki App

### Prerequisites
- [Docker CE](https://www.docker.com/)
- [Docker compose](https://docs.docker.com/compose/install/)
- Login to gitlab registry

```
$ docker login registry.gitlab.com
// Enter your email and password
```

### Installation
```
$ git clone https://gitlab.com/pascaliaasia/anki_app_backend.git
$ cd anki_app_backend
$ cp .env.sample .env
```
Open any editor and input your AWS Access Key to `.env` (which can be found on https://goo.gl/hYm2Wt)
For development process, change MONGODB_HOST=127.0.0.1 in `.env`

### Start services
To start all docker container, run `docker-compose up`

If you want to start only mongodb, run `docker-compose up db`

For development process, you can start only mongodb by docker and run api server manually by NodeJS
```
$ docker-compose up db
// Open new console tab
$ yarn install
$ yarn dev
// To edit admin page, open new console tab
$ cd admin
$ yarn start
```

**Note:** if you have errors about binding container to your machine, check `Docker > Preferences > File Sharing`. Docker may not have permission you write to path.

### Environment
#### Localhost
- Host: `localhost`
- Api is running on `:3000`
- Mongodb is running on `:27017`

#### Staging
- Host: `52.192.82.62`
- API is running on `:80`
- Mongodb is running on `:27017`

**Note**: With staging environment, you can access API from anywhere. But mongodb can only accessed through PAV's ip for administration.
