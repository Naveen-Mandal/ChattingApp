FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /build

COPY pom.xml .

RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests


FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /build/target/backend-0.0.1-SNAPSHOT.jar backend.jar

EXPOSE 8080

CMD ["java", "-jar", "backend.jar"]
