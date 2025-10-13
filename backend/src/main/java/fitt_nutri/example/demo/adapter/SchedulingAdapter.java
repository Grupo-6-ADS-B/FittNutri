package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.request.SchedulingRequestDTO;
import fitt_nutri.example.demo.dto.response.SchedulingResponseDTO;
import fitt_nutri.example.demo.model.SchedulingModel;
import fitt_nutri.example.demo.service.SchedulingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchedulingAdapter {

    private final SchedulingService service;

    public SchedulingResponseDTO create(SchedulingRequestDTO dto) {
        SchedulingModel scheduling = service.createScheduling(dto);
        return toDTO(scheduling);
    }

    public SchedulingResponseDTO getById(Integer id) {
        SchedulingModel scheduling = service.getSchedulingById(id);
        return toDTO(scheduling);
    }

    public List<SchedulingResponseDTO> getAll() {
        return service.getAllSchedulings()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SchedulingResponseDTO> getByPatient(Integer pacienteId) {
        return service.getByPatient(pacienteId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SchedulingResponseDTO> getByNutritionist(Integer usuarioId) {
        return service.getByNutritionist(usuarioId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SchedulingResponseDTO update(Integer id, SchedulingRequestDTO dto) {
        SchedulingModel scheduling = service.updateScheduling(id, dto);
        return toDTO(scheduling);
    }

    public SchedulingResponseDTO updateDate(Integer id, java.time.LocalDate newDate) {
        SchedulingModel scheduling = service.updateDate(id, newDate);
        return toDTO(scheduling);
    }

    public SchedulingResponseDTO updateObservacoes(Integer id, String observacoes) {
        SchedulingModel scheduling = service.updateObservacoes(id, observacoes);
        return toDTO(scheduling);
    }

    public void delete(Integer id) {
        service.deleteScheduling(id);
    }

    private SchedulingResponseDTO toDTO(SchedulingModel s) {
        return new SchedulingResponseDTO(
                s.getId(),
                s.getPaciente().getNome(),
                s.getNutricionista().getNome(),
                s.getDataAgendada(),
                s.getObservacoes()
        );
    }
}
