package fitt_nutri.example.demo.observer;

import fitt_nutri.example.demo.model.FormModel;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class FormSubject implements Subject {

    private final List<Observer> observers = new CopyOnWriteArrayList<>();

    // Spring injeta todas as beans que implementam Observer
    public FormSubject(List<Observer> initialObservers) {
        if (initialObservers != null) {
            observers.addAll(initialObservers);
        }
    }

    @Override
    public void register(Observer observer) {
        if (observer != null && !observers.contains(observer)) {
            observers.add(observer);
        }
    }

    @Override
    public void unregister(Observer observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers(FormModel form) {
        for (Observer observer : observers) {
            observer.update(form);
        }
    }
}
