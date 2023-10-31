# PresenTly Backend v0.2

This is a rework of PresenTly backend with scalability and availability focus.

## Services
- Auth Service
- User Service
- SMTP Service
- Friend Service
- Recommendation Service
- Upload Service
- Web Gateway
- Mobile Gateway

## Technologies Used

- TypeScript
- Redis
- RabbitMQ
- Docker
- Docker-compose

## Setting up the dev server

In order not to waste time awaiting builds, dev flow uses hybrid Dockerized approach: Redis and RabbitMQ are dockerized, whereas the services being developed are run manually (`npm start`).

Each service's dependencies must be manually installed via `npm i`

### Setting up secrets

For each service a sample.env file is provided. Make sure to configure .env files for each service accordingly. Gateway API(s) will need to know the service secrets, make sure the values in Gateway API(s)' configurations match those of the individual services.

Redis emphasizes the use of a long random byte string. Generate one by running node REPL:
```
$ node
$ require('crypto').randomBytes(140).toString('hex')
```
Copy paste the output to REDIS_PASS in each file. There is only a single redis pass for all services, whereas each service should have a unique password for RabbitMQ.

Run the env_to_secrets script to copy all secrets from .env files to a secrets folder (`source env_to_secrets.sh`). Then, delete the repeating secrets from the docker-compose.yml 🫠

*Any help to streamline this process is highly appreciated*

### Running the services

Each service can be started with `npm start`. Most, if not all, services depend on Redis and/or RabbitMQ. To start these services you can use `docker-compose up` command on the root directory. Each service is being designed to be tolerant to failures of other services, including infrastructure services (RabbitMQ and Redis) so the order in which they're spun up shouldn't matter. However spinning up Docker takes more time so it's recommended to begin with docker-compose, then move on to individual services.

### Concerns

+ Micro services, in theory, are great for scalability and resiliency. I have never deployed a micro service architecture and foresee a lot of pain points to come in deployment.
+ Web Front-end `send-request` function needs to include `{credentials: 'include'}` option when doing `fetch` requests. This is because the web gateway relies on refresh tokens set in http-only cookies for added security.
+ Web front-end should keep the access token even if it expired. This is because the gateway api will automatically refresh the access token if presented with a valid refresh token cookie, saving the user a trip to the login page.
+ Native Front-end will need to track the expiration of accessTokens and use a manual refresh endpoint on the mobile gateway API to get a new accessToken and refreshToken pair.

#### Deployment Concerns

Heroku while offering a similar mechanism to docker-compose, does not support RabbitMQ directly as an add-on. Redis is available as an add-on. If we were to deploy on Heroku, we might need some modification to how we configure/use amqp and possibly incur additional costs due to using Redis and RabbitMQ equivalent add-ons as Heroku services.

Digital Ocean offers Kubernetes which is a good fit for this project. Although not free, Github Student credits apply. Steep learning curve. We would need to modify how we configure secrets.

Cloud services (like AWS, GCP, Azure) all offer VMs in free tiers, however they usually allow for 1 or 2 instances, which loses the benefit of scalability. Also they'll have the steepest learning curves.

**Suggestions welcome**

## API Documentation

This documentation assumes all services are up and running. The only services to be contacted from outside are Gateway APIs. Web Gateway API runs by default on localhost:3010 .

### User Authentication
---
#### Signup - Create a new user

- **Endpoint**: `POST /api/users`
- **Request Body**: JSON object containing:
  - `email` (required, string)
  - `password` (required, string)
  - `name` (optional, string)
  - `dob` (optional, Date - yyyy-mm-dd)
  - `gender` (optional, sring - one of "female", "male", "other")
  - `tel` (optional, number)
  - `photo` (optional, string)
  - `interests` (optional, string[])
  - `location` (optional, string)
  - `bio` (optional, string)
- **Response**: JSON object containing:
  - `accessToken`

*Note: will set an http-only cookie with the refresh token. Refresh tokens are automatically processed so this process should not require changes on frontend, except for allowing cookies to be sent cross-origin on fetch*

#### Login - Authenticate an existing user

- **Endpoint**: `POST /api/users/login`
- **Request Body**: JSON object containing:
  - `email` (required, string)
  - `password` (required, string)
- **Response**: JSON object containing:
  - `accessToken`
  
*Note: will set refresh token in http-only cookie*

#### Logout - Revokes the user's refresh token
- **Endpoint**: `POST /api/users/logout`
- **Authorization**: Bearer Token
- **Response**: JSON object containing:
    - `message: 'Logged out'`

### User Profile
---
#### Get Profile - Gets current user's profile
- **Endpoint**: `GET /api/users/profile/all`
- **Authorization**: Bearer Token
- **Response**: JSON object containing:
    - `_id` (Profile Id)
    - `user` (User Id)
    - `name`
    - `dob`
    - `gender`
    - `tel`
    - `photo`
    - `interests`
    - `bio`
    - `location`
    - `isVerified` (Email verification status)
  
#### Update Profile - Update current user's profile
- **Endpoint**: `PUT /api/users/profile`
- **Authorization**: Bearer Token
- **Request Body**: JSON object containing:
  - `name` (optional, string)
  - `dob` (optional, Date - yyyy-mm-dd)
  - `gender` (optional, sring - one of "female", "male", "other")
  - `tel` (optional, number)
  - `interests` (optional, string[])
  - `location` (optional, string)
  - `bio` (optional, string)
- **Response**: JSON object containing:
  - `message: "Profile updated"`
  - `...profile`