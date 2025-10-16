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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

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
}
