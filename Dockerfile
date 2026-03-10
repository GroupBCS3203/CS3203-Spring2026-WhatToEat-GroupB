###################################################
# Stage: base
# 
# This base stage ensures all other stages are using the same base image
# and provides common configuration for all stages, such as the working dir.
###################################################
FROM node:22 AS base
WORKDIR /usr/local/app

################## CLIENT STAGES ##################

###################################################
# Stage: client-base
#
# This stage is used as the base for the client-dev and client-build stages,
# since there are common steps needed for each.
###################################################
FROM base AS client-base
COPY my-react-app/package.json my-react-app/package-lock.json ./
RUN npm install
COPY my-react-app/eslint.config.js my-react-app/index.html my-react-app/vite.config.js ./
COPY my-react-app/public ./public
COPY my-react-app/src ./src

###################################################
# Stage: client-dev
# 
# This stage is used for development of the client application. It sets 
# the default command to start the Vite development server.
###################################################
FROM client-base AS client-dev
CMD ["npm", "run", "dev"]

###################################################
# Stage: client-build
#
# This stage builds the client application, producing static HTML, CSS, and
# JS files that can be served by the backend.
###################################################
FROM client-base AS client-build
RUN npm run build




###################################################
################  BACKEND STAGES  #################
###################################################

###################################################
# Stage: backend-base
#
# This stage is used as the base for the backend-dev and test stages, since
# there are common steps needed for each.
###################################################


###################################################
# Stage: test
#
# This stage runs the tests on the backend. This is split into a separate
# stage to allow the final image to not have the test dependencies or test
# cases.
###################################################


###################################################
# Stage: final
#
# This stage is intended to be the final "production" image. It sets up the
# backend and copies the built client application from the client-build stage.
#
# It pulls the package.json and package-lock.json from the test stage to ensure that
# the tests run (without this, the test stage would simply be skipped).
###################################################
