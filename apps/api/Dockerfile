# Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY apps/api/UdemyClone.Api.csproj apps/api/
RUN dotnet restore apps/api/UdemyClone.Api.csproj

COPY apps/api/ apps/api/
WORKDIR /src/apps/api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "UdemyClone.Api.dll"]
