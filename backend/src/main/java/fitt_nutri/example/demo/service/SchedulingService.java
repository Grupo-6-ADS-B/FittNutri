package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.SchedulingRequestDTO;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private final SchedulingRepository repository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private UserModel getNutricionistaLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Nutricionista não encontrado"));
    }

    private void verificarPropriedadeAgendamento(SchedulingModel scheduling) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        if (scheduling.getNutricionista() != null && scheduling.getNutricionista().getEmail() != null) {
            if (!scheduling.getNutricionista().getEmail().equals(emailLogado)) {
                throw new AccessDeniedException("Acesso negado: este agendamento não pertence ao nutricionista logado");
            }
        }
    }

    @Transactional
    public SchedulingModel createScheduling(SchedulingRequestDTO dto) {
        UserModel nutritionist = getNutricionistaLogado();
        PatientModel patient = patientRepository.findById(dto.pacienteId())
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        if (patient.getNutricionista() == null || !patient.getNutricionista().getId().equals(nutritionist.getId())) {
            patient.setNutricionista(nutritionist);
            patientRepository.save(patient);
        }

        SchedulingModel scheduling = new SchedulingModel();
        scheduling.setPaciente(patient);
        scheduling.setNutricionista(nutritionist);
        scheduling.setDataAgendada(dto.dataAgendada());
        scheduling.setObservacoes(dto.observacoes());

        SchedulingModel saved = repository.save(scheduling);
        emailService.sendAppointmentConfirmationEmail(
                patient.getEmail(),
                patient.getNome(),
                nutritionist.getNome(),
                saved.getDataAgendada(),
                saved.getObservacoes()
        );
        return saved;
    }

    public List<SchedulingModel> getAllSchedulings() {
        UserModel nutri = getNutricionistaLogado();
        return repository.findByNutricionistaId(nutri.getId());
    }

    public SchedulingModel getSchedulingById(Integer id) {
        SchedulingModel scheduling = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));
        verificarPropriedadeAgendamento(scheduling);
        return scheduling;
    }

    public List<SchedulingModel> getByPatient(Integer pacienteId) {
        PatientModel patient = patientRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        if (patient.getNutricionista() != null && patient.getNutricionista().getEmail() != null) {
            if (!patient.getNutricionista().getEmail().equals(emailLogado)) {
                throw new AccessDeniedException("Acesso negado: este paciente não pertence ao nutricionista logado");
            }
        }
        return repository.findByPacienteId(pacienteId);
    }

    public List<SchedulingModel> getByNutritionist(Integer usuarioId) {
        UserModel nutri = getNutricionistaLogado();
        return repository.findByNutricionistaId(nutri.getId());
    }

    public Page<SchedulingModel> getByNutritionist(Integer usuarioId, Pageable pageable) {
        UserModel nutriLogado = getNutricionistaLogado();
        if (!nutriLogado.getId().equals(usuarioId)) {
            throw new AccessDeniedException("Acesso negado: esta agenda não pertence ao nutricionista logado");
        }
        return repository.findByNutricionistaId(usuarioId, pageable);
    }


    @Transactional
    public SchedulingModel updateScheduling(Integer id, SchedulingRequestDTO dto) {
        SchedulingModel scheduling = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));
        verificarPropriedadeAgendamento(scheduling);

        if (dto.dataAgendada() != null) scheduling.setDataAgendada(dto.dataAgendada());
        if (dto.observacoes() != null && !dto.observacoes().isBlank())
            scheduling.setObservacoes(dto.observacoes());

        return repository.save(scheduling);
    }

    @Transactional
    public void deleteScheduling(Integer id) {
        SchedulingModel scheduling = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));
        verificarPropriedadeAgendamento(scheduling);
        scheduling.setDeletedAt(java.time.LocalDateTime.now());
        repository.save(scheduling);
    }

    @Transactional
    public SchedulingModel updateDate(Integer id, LocalDate newDate) {
        SchedulingModel scheduling = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));
        verificarPropriedadeAgendamento(scheduling);
        LocalTime horaAtual = scheduling.getDataAgendada() != null
                ? scheduling.getDataAgendada().toLocalTime() : LocalTime.MIDNIGHT;
        scheduling.setDataAgendada(LocalDateTime.of(newDate, horaAtual));
        return repository.save(scheduling);
    }

    @Transactional
    public SchedulingModel updateObservacoes(Integer id, String observacoes) {
        SchedulingModel scheduling = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado"));
        verificarPropriedadeAgendamento(scheduling);
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
                .filter(s -> s.getDataAgendada().toLocalDate().equals(date))
                .count();
    }
}
