@echo off
echo Setting JAVA_HOME to C:\Program Files\Java\jdk-25.0.2...
set JAVA_HOME=C:\Program Files\Java\jdk-25.0.2
cd backend
echo Starting Spring Boot backend...
.\mvnw.cmd spring-boot:run
pause
