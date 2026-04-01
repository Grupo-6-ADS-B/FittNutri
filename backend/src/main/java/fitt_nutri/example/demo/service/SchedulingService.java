package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.SchedulingRequestDTO;
import fitt_nutri.example.demo.dto.response.SchedulingResponseDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.SchedulingModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.repository.SchedulingRepository;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private final SchedulingRepository repository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Transactional
    public SchedulingModel createScheduling(SchedulingRequestDTO dto) {
        PatientModel patient = patientRepository.findById(dto.pacienteId())
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        UserModel nutritionist = userRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new NotFoundException("Nutricionista não encontrado"));

        SchedulingModel scheduling = new SchedulingModel();
        scheduling.setPaciente(patient);
        scheduling.setNutricionista(nutritionist);
        scheduling.setDataAgendada(dto.dataAgendada());
        scheduling.setObservacoes(dto.observacoes());

        return repository.save(scheduling);
    }

    public List<SchedulingModel> getAllSchedulings() {
        return repository.findAll();
    }

    public SchedulingModel getSchedulingById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));
    }

    public List<SchedulingModel> getByPatient(Integer pacienteId) {
        if (!patientRepository.existsById(pacienteId)) {
            throw new NotFoundException("Paciente não encontrado");
        }
        return repository.findByPacienteId(pacienteId);
    }

    public List<SchedulingModel> getByNutritionist(Integer usuarioId) {
        if (!userRepository.existsById(usuarioId)) {
            throw new NotFoundException("Nutricionista não encontrado");
        }
        return repository.findByNutricionistaId(usuarioId);
    }

    public Page<SchedulingModel> getByNutritionist(Integer usuarioId, Pageable pageable) {
        if (!userRepository.existsById(usuarioId)) {
            throw new NotFoundException("Nutricionista não encontrado");
        }
        return repository.findByNutricionistaId(usuarioId, pageable);
    }


    @Transactional
    public SchedulingModel updateScheduling(Integer id, SchedulingRequestDTO dto) {
        SchedulingModel scheduling = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));

        if (dto.dataAgendada() != null) scheduling.setDataAgendada(dto.dataAgendada());
        if (dto.observacoes() != null && !dto.observacoes().isBlank())
            scheduling.setObservacoes(dto.observacoes());

        return repository.save(scheduling);
    }

    @Transactional
    public void deleteScheduling(Integer id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Agendamento não encontrado");
        }
        repository.deleteById(id);
    }

    @Transactional
    public SchedulingModel updateDate(Integer id, LocalDate newDate) {
        SchedulingModel scheduling = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));
        scheduling.setDataAgendada(newDate);
        return repository.save(scheduling);
    }

    @Transactional
    public SchedulingModel updateObservacoes(Integer id, String observacoes) {
        SchedulingModel scheduling = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));
        scheduling.setObservacoes(observacoes);
        return repository.save(scheduling);
    }

    public Long countByPatient(Integer pacienteId) {
        if (!patientRepository.existsById(pacienteId)) {
            throw new NotFoundException("Paciente não encontrado");
        }
        return repository.findByPacienteId(pacienteId).stream().count();
    }

    public Long countByDate(LocalDate date) {
        return repository.findAll().stream()
                .filter(s -> s.getDataAgendada().equals(date))
                .count();
    }

    // ===== MÉTODOS COM RETORNO DTO (para Controller) =====

    public SchedulingResponseDTO createAndReturn(SchedulingRequestDTO dto) {
        SchedulingModel scheduling = createScheduling(dto);
        return toResponseDTO(scheduling);
    }

    public SchedulingResponseDTO getByIdAndReturn(Integer id) {
        SchedulingModel scheduling = getSchedulingById(id);
        return toResponseDTO(scheduling);
    }

    public List<SchedulingResponseDTO> getAllAndReturn() {
        return getAllSchedulings()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<SchedulingResponseDTO> getByPatientAndReturn(Integer pacienteId) {
        return getByPatient(pacienteId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<SchedulingResponseDTO> getByNutritionistAndReturn(Integer usuarioId) {
        return getByNutritionist(usuarioId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Page<SchedulingResponseDTO> getByNutritionistAndReturn(Integer usuarioId, Pageable pageable) {
        Page<SchedulingModel> page = getByNutritionist(usuarioId, pageable);
        return page.map(this::toResponseDTO);
    }

    public SchedulingResponseDTO updateAndReturn(Integer id, SchedulingRequestDTO dto) {
        SchedulingModel scheduling = updateScheduling(id, dto);
        return toResponseDTO(scheduling);
    }

    public SchedulingResponseDTO updateDateAndReturn(Integer id, LocalDate newDate) {
        SchedulingModel scheduling = updateDate(id, newDate);
        return toResponseDTO(scheduling);
    }

    public SchedulingResponseDTO updateObservacoeseAndReturn(Integer id, String observacoes) {
        SchedulingModel scheduling = updateObservacoes(id, observacoes);
        return toResponseDTO(scheduling);
    }

    private SchedulingResponseDTO toResponseDTO(SchedulingModel s) {
        return new SchedulingResponseDTO(
                s.getId(),
                s.getPaciente().getNome(),
                s.getNutricionista().getNome(),
                s.getDataAgendada(),
                s.getObservacoes()
        );
    }
}
