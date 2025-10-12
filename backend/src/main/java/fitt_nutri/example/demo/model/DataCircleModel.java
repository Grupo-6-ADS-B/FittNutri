    package fitt_nutri.example.demo.model;

    import jakarta.persistence.*;
    import jakarta.validation.constraints.Max;
    import jakarta.validation.constraints.NotBlank;
    import jakarta.validation.constraints.NotNull;
    import lombok.AllArgsConstructor;
    import lombok.Getter;
    import lombok.NoArgsConstructor;
    import lombok.Setter;

    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    @Entity
    @Table(name = "dados_circunferencia")
    public class DataCircleModel {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Integer idDadosCircunferencia;

        @NotBlank(message = "O rótulo da medição não pode estar vazio")
        @Column(nullable = false, unique = true) // Garante que este valor seja único no banco de dados
        private String rotulo;1

        @NotNull(message = "Abdominal não pode estar vazio")
        @Column(nullable = false)
        private Double abdominal;


        @NotNull(message = "Cintura não pode estar vazio")
        @Column(nullable = false)
        private Double cintura;

        @NotNull(message = "Quadril não pode estar vazio")
        @Column(nullable = false)
        private Double quadril;

        @NotNull(message = "Punho não pode estar vazio")
        @Column(nullable = false)
        private Double pulso;

        @NotNull(message = "Panturrilha não pode estar vazio")
        @Column(nullable = false)
        private Double panturrilha;

        @NotNull(message = "Braco não pode estar vazio")
        @Column(nullable = false)
        private Double braco;

        @NotNull(message = "Coxa não pode estar vazio")
        @Column(nullable = false)
        private Double coxa;

        @NotNull(message = "Peso ideal não pode estar vazio")
        @Column(nullable = false)
        @Max(150)
        private Double pesoIdeal;


    }
