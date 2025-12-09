# Ft_transcendence

**This is a full-stack web application of Pong Game 🏓**

## :cd: Operating System

This project was tested on **MacOS Catalina (ver. 10.15.7)** with **Docker Desktop (ver. 4.4.2.)**

## :green_circle: How to run

:exclamation: **`Don't forget to run Docker first`**

Use Makefile commands to work with the program.

### Usage:
  **make \<target\>**

### Targets:
- **start** -         🚀 Full start process (setup + run)
- **stop** -          🛑 Stop all services (graceful shutdown)
- **re** -            🔄 Restart everything
- **up** -            🐳 Start containers with build
- **down** -          🛑 Stop containers
- **clean** -         🧹 Clean everything (volumes, images, orphans)
- **setup-local** -   🌐 Setup local environment (IP, certs, etc.)
- **setup-ngrok** -   🚪 Setup ngrok tunnel
- **logs** -          📄 View container logs
- **ps** -            📊 Show container status
- **env-check** -     🔍 Verify environment files exist
- **help** -          🆘 Display this help message

:exclamation: **`By default "make" uses <help> target`**

## :green_circle: Modules

To achieve 100% project completion, a minimum of **14 points in a combination of major and minor modules**.

:warning: **`1 Major Module = 2 Minor Modules`**

### Modules to include definitely:

\# | Module | Point | Description
|:---|:---|:---|:---|
**1** | Major | (1)   |	**backend framework. (Fastify)**
**3** | Minor | (1) | **database (SQLITE).**
**4** | Major | (2)   |	**Standard user management, authentication, users across tournaments.**
**5** | Major | (2)   |	**Remote players.**
**6** | Minor | (1)   |	**Implement Two-Factor Authentication (2FA).**
**7** | Minor | (1)   |	**JWT & CyberSecurity.**
**8** | Major | (2)   |	**Replace basic Pong with server-side Pong and implement an API.**
**9** | Minor | (1) |	**Supports multiple languages.**
**10** | Minor | (1) | **Expanding browser compatibility. + 2 browsers (3 browsers in total)**
| | **Total Major Modules:** | **(6)** | |


### Modules to choose:

Module | Point | Description
|:---|:---|:---|
Major | (1)   |	**Use advanced 3D techniques.**
Minor | (0,5) |	**Support on all devices.**
Minor | (0,5) |	**Game customization options.**