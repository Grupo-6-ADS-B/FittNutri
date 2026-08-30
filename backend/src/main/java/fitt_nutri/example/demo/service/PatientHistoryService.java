package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.EvolucaoPacienteDTO;
import fitt_nutri.example.demo.dto.request.ConsultaPacienteRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientHistoryResponseDTO;
import fitt_nutri.example.demo.exceptions.InvalidDataException;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public List<PatientHistoryResponseDTO> listarPorPaciente(Integer pacienteId) {
        PatientModel patient = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);
        return repository.findByPatientModelIdOrderByDataConsultaAsc(pacienteId).stream()
                .map(this::toHistoryResponseDTO)
                .toList();
    }

    private PatientHistoryResponseDTO toHistoryResponseDTO(PatientHistoryModel h) {
        return new PatientHistoryResponseDTO(
                h.getId(),
                h.getDataConsulta(),
                h.getMotivoConsulta(),
                toAnthropometricDTO(h.getAnthropometricDataModel()),
                toDataCircleDTO(h.getDataCircleModel())
        );
    }

    private PatientHistoryResponseDTO.AnthropometricDataResponseDTO toAnthropometricDTO(AnthropometricDataModel a) {
        if (a == null) return null;
        return new PatientHistoryResponseDTO.AnthropometricDataResponseDTO(
                a.getIdDadosAntropometricos(), a.getPeso(), a.getAltura(), a.getIdade(), a.getImc(),
                a.getPorcentagemGordura(), a.getMassaMuscular(), a.getGorduraVisceral(),
                a.getTaxaMetabolicaBasal(), a.getIdadeMetabolica()
        );
    }

    private PatientHistoryResponseDTO.DataCircleResponseDTO toDataCircleDTO(DataCircleModel c) {
        if (c == null) return null;
        return new PatientHistoryResponseDTO.DataCircleResponseDTO(
                c.getIdDadosCircunferencia(), c.getAbdominal(), c.getCintura(), c.getQuadril(), c.getPulso(),
                c.getPanturrilha(), c.getBraco(), c.getCoxa(), c.getPesoIdeal()
        );
    }

    public PatientHistoryModel salvar(PatientHistoryModel historico) {
        return repository.save(historico);
    }

    @Transactional
    public void salvarConsulta(Integer pacienteId, ConsultaPacienteRequestDTO dto) {

        PatientModel paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        verificarPropriedadePaciente(paciente);

        if (dto.getAntropometria() == null) {
            throw new InvalidDataException("Dados antropométricos são obrigatórios");
        }
        if (dto.getCircunferencia() == null) {
            throw new InvalidDataException("Dados de circunferência são obrigatórios");
        }

        AnthropometricDataModel antropo = new AnthropometricDataModel();

        antropo.setPeso(dto.getAntropometria().getPeso());
        antropo.setAltura(dto.getAntropometria().getAltura());
        antropo.setImc(dto.getAntropometria().getImc());
        antropo.setGorduraVisceral(dto.getAntropometria().getGorduraVisceral());
        antropo.setPorcentagemGordura(dto.getAntropometria().getPorcentagemGordura());
        antropo.setMassaMuscular(dto.getAntropometria().getMassaMuscular());
        antropo.setIdadeMetabolica(dto.getAntropometria().getIdadeMetabolica());
        antropo.setTaxaMetabolicaBasal(dto.getAntropometria().getTaxaMetabolicaBasal());
        antropo.setIdade(dto.getAntropometria().getIdade());

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
        historico.setMotivoConsulta(dto.getMotivoConsulta());

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

        return historicos.stream().map(this::mapToEvolucaoDTO).toList();
    }

    // Nova sobrecarga paginada (retorna Page)
    public Page<EvolucaoPacienteDTO> buscarEvolucaoPorPeriodo(
            Integer pacienteId,
            String dataInicio,
            String dataFim,
            Pageable pageable
    ) {
        LocalDate inicio = LocalDate.parse(dataInicio);
        LocalDate fim = LocalDate.parse(dataFim);

        Page<PatientHistoryModel> page = repository.buscarPorPacienteEPeriodo(pacienteId, inicio, fim, pageable);

        return page.map(this::mapToEvolucaoDTO);
    }

    private EvolucaoPacienteDTO mapToEvolucaoDTO(PatientHistoryModel h) {
        EvolucaoPacienteDTO dto = new EvolucaoPacienteDTO();
        dto.setDataConsulta(h.getDataConsulta());

        if (h.getAnthropometricDataModel() != null) {
            AnthropometricDataModel a = h.getAnthropometricDataModel();
            dto.setPeso(a.getPeso());
            dto.setImc(a.getImc());
            dto.setMassaMuscular(a.getMassaMuscular());
            dto.setGordura(a.getPorcentagemGordura());
            dto.setAltura(a.getAltura());
            dto.setGorduraVisceral(a.getGorduraVisceral());
            dto.setIdadeMetabolica(a.getIdadeMetabolica() != null ? a.getIdadeMetabolica().doubleValue() : null);
            dto.setTaxaMetabolicaBasal(a.getTaxaMetabolicaBasal());
            dto.setIdade(a.getIdade());
        }
        dto.setAtividade(h.getPatientModel() != null ? h.getPatientModel().getAtividade() : null);
        dto.setMotivoConsulta(
            h.getMotivoConsulta() != null && !h.getMotivoConsulta().isBlank()
                ? h.getMotivoConsulta()
                : (h.getPatientModel() != null ? h.getPatientModel().getMotivoConsulta() : null)
        );

        if (h.getDataCircleModel() != null) {
            DataCircleModel c = h.getDataCircleModel();
            dto.setCintura(c.getCintura());
            dto.setAbdominal(c.getAbdominal());
            dto.setQuadril(c.getQuadril());
            dto.setBraco(c.getBraco());
            dto.setCoxa(c.getCoxa());
            dto.setPanturrilha(c.getPanturrilha());
            dto.setPulso(c.getPulso());
            dto.setPesoIdeal(c.getPesoIdeal());
        }

        return dto;
    }



}
