package fitt_nutri.example.demo.observer;

import fitt_nutri.example.demo.model.FormModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LoggingObserver implements Observer {

    private static final Logger log = LoggerFactory.getLogger(LoggingObserver.class);

    @Override
    public void update(FormModel form) {
        log.info("Form atualizado: id={} nome={} mensagem={}", form.getId(), form.getNome(), form.getMensagem());
    }
}
