package fitt_nutri.example.demo.config.Swagger;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Fitt Nutri API",
                version = "1.0",
                description = "API para gerenciamento de usuários, nutricionistas e agendamentos",
                contact = @Contact(
                        name = "Equipe Fitt Nutri: Giovanna Mafra, Larissa Silvério," +
                                "Kaio Kenuy, Lucas Cartaxo," +
                                "Leandro Mandu e Pedro Cruz",
                        url = "https://github.com/Grupo-6-ADS-B/FittNutri",
                        email = "Fitnutri@gmail.com"
                ),
                license = @License(name = "UNLISCENSED")
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Servidor Local")
        }
)
@SecurityScheme(name = "Bearer",type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = ")WT")
public class OpenApiConfig {

}