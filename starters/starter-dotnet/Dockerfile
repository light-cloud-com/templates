FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

# Restore first so the package layer is cached between builds.
COPY DotnetApi.csproj ./
RUN dotnet restore DotnetApi.csproj

COPY . ./
RUN dotnet publish DotnetApi.csproj -c Release -o out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080

ENTRYPOINT ["dotnet", "DotnetApi.dll"]
