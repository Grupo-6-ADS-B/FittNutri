package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.EvolucaoPacienteDTO;
import fitt_nutri.example.demo.dto.request.ConsultaPacienteRequestDTO;
import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.model.PatientHistoryModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.AnthropometricDataRepository;
import fitt_nutri.example.demo.repository.DataCircleRepository;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientHistoryService {

    private final PatientHistoryRepository repository;
    private final PatientRepository pacienteRepository;
    private final AnthropometricDataRepository dadosAntropometricosRepository;
    private final DataCircleRepository dadosCircunferenciaRepository;



    private void verificarPropriedadePaciente(PatientModel patient) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        if (patient.getNutricionista() == null || !emailLogado.equals(patient.getNutricionista().getEmail())) {
            throw new AccessDeniedException("Acesso negado: este paciente não pertence ao nutricionista logado");
        }
    }

    public List<PatientHistoryModel> listarPorPaciente(Integer pacienteId) {
        PatientModel patient = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);
        return repository.findByPatientModelIdOrderByDataConsultaAsc(pacienteId);
    }

    public PatientHistoryModel salvar(PatientHistoryModel historico) {
        return repository.save(historico);
    }

    @Transactional
    public void salvarConsulta(Integer pacienteId, ConsultaPacienteRequestDTO dto) {

        PatientModel paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        verificarPropriedadePaciente(paciente);

        AnthropometricDataModel antropo = new AnthropometricDataModel();

        antropo.setPeso(dto.getAntropometria().getPeso());
        antropo.setAltura(dto.getAntropometria().getAltura());
        antropo.setIdade(dto.getAntropometria().getIdade());
        antropo.setImc(dto.getAntropometria().getImc());
        antropo.setGorduraVisceral(dto.getAntropometria().getGorduraVisceral());
        antropo.setPorcentagemGordura(dto.getAntropometria().getPorcentagemGordura());
        antropo.setMassaMuscular(dto.getAntropometria().getMassaMuscular());
        antropo.setIdadeMetabolica(dto.getAntropometria().getIdadeMetabolica());
        antropo.setTaxaMetabolicaBasal(dto.getAntropometria().getTaxaMetabolicaBasal());

        antropo.setPaciente(paciente);

        AnthropometricDataModel antropoSalvo =
                dadosAntropometricosRepository.save(antropo);

        DataCircleModel circ = new DataCircleModel();

        circ.setCintura(dto.getCircunferencia().getCintura());
        circ.setAbdominal(dto.getCircunferencia().getAbdominal());
        circ.setQuadril(dto.getCircunferencia().getQuadril());
        circ.setPulso(dto.getCircunferencia().getPulso());
        circ.setPanturrilha(dto.getCircunferencia().getPanturrilha());
        circ.setBraco(dto.getCircunferencia().getBraco());
        circ.setCoxa(dto.getCircunferencia().getCoxa());
        circ.setPesoIdeal(dto.getCircunferencia().getPesoIdeal());

        circ.setPaciente(paciente);

        DataCircleModel circSalvo =
                dadosCircunferenciaRepository.save(circ);

        PatientHistoryModel historico = new PatientHistoryModel();
        historico.setPatientModel(paciente);
        historico.setAnthropometricDataModel(antropoSalvo);
        historico.setDataCircleModel(circSalvo);
        historico.setDataConsulta(dto.getDataConsulta());

        repository.save(historico);
    }




    public List<EvolucaoPacienteDTO> buscarEvolucaoPorPeriodo(
            Integer pacienteId,
            String dataInicio,
            String dataFim
    ) {
        PatientModel patient = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);

        LocalDate inicio = LocalDate.parse(dataInicio);
        LocalDate fim = LocalDate.parse(dataFim);

        List<PatientHistoryModel> historicos =
                repository.buscarPorPacienteEPeriodo(pacienteId, inicio, fim);

        return historicos.stream().map(h -> {

            EvolucaoPacienteDTO dto = new EvolucaoPacienteDTO();
            dto.setDataConsulta(h.getDataConsulta());

            // 🔹 ANTROPOMETRIA
            dto.setPeso(h.getAnthropometricDataModel().getPeso());
            dto.setImc(h.getAnthropometricDataModel().getImc());
            dto.setMassaMuscular(h.getAnthropometricDataModel().getMassaMuscular());
            dto.setGordura(h.getAnthropometricDataModel().getPorcentagemGordura());
            dto.setAltura(h.getAnthropometricDataModel().getAltura());
            dto.setGorduraVisceral(h.getAnthropometricDataModel().getGorduraVisceral());
            dto.setIdadeMetabolica(h.getAnthropometricDataModel().getIdadeMetabolica() != null
                    ? h.getAnthropometricDataModel().getIdadeMetabolica().doubleValue() : null);
            dto.setTaxaMetabolicaBasal(h.getAnthropometricDataModel().getTaxaMetabolicaBasal());
            dto.setAtividade(h.getPatientModel().getAtividade());

            // 🔹 CIRCUNFERÊNCIA
            dto.setCintura(h.getDataCircleModel().getCintura());
            dto.setAbdominal(h.getDataCircleModel().getAbdominal());
            dto.setQuadril(h.getDataCircleModel().getQuadril());
            dto.setBraco(h.getDataCircleModel().getBraco());
            dto.setCoxa(h.getDataCircleModel().getCoxa());
            dto.setPanturrilha(h.getDataCircleModel().getPanturrilha());
            dto.setPulso(h.getDataCircleModel().getPulso());
            dto.setPesoIdeal(h.getDataCircleModel().getPesoIdeal());

            return dto;

        }).toList();

    }



}
