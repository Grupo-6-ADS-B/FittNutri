package fitt_nutri.example.demo.job;

import fitt_nutri.example.demo.model.SchedulingModel;
import fitt_nutri.example.demo.repository.SchedulingRepository;
import fitt_nutri.example.demo.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentReminderJob {

    private final SchedulingRepository schedulingRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 8 * * *", zone = "America/Sao_Paulo")
    public void sendDailyReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<SchedulingModel> agendamentos = schedulingRepository.findByDataAgendadaBetween(
                tomorrow.atStartOfDay(), tomorrow.atTime(LocalTime.MAX));
        log.info("[reminder-job] {} agendamento(s) encontrado(s) para amanhã ({})", agendamentos.size(), tomorrow);
        for (SchedulingModel s : agendamentos) {
            emailService.sendAppointmentReminderEmail(
                    s.getPaciente().getEmail(),
                    s.getPaciente().getNome(),
                    s.getNutricionista().getNome(),
                    s.getDataAgendada()
            );
        }
    }
}
