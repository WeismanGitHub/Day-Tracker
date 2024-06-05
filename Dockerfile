ARG DOTNET_OS_VERSION="-alpine"
ARG DOTNET_SDK_VERSION=8.0

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_SDK_VERSION}${DOTNET_OS_VERSION} AS build-server
WORKDIR /src

COPY Server/*.csproj ./Server/
RUN dotnet restore ./Server/Server.csproj

COPY Server/. ./Server/
WORKDIR /src/Server
RUN dotnet publish -c Release -o /app/Server

FROM node:alpine AS build-client
WORKDIR /src/Client

COPY Client/package*.json ./
RUN npm install

COPY Client/. ./
RUN npm run build-prod

FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_SDK_VERSION}${DOTNET_OS_VERSION}

ENV ASPNETCORE_URLS http://+:8080
ENV ASPNETCORE_ENVIRONMENT Production

EXPOSE 8080

WORKDIR /app/Server

COPY --from=build-server /app/Server .

COPY --from=build-client /src/Client/dist /app/Server/wwwroot

ENTRYPOINT ["dotnet", "Server.dll"]