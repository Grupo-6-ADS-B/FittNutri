package fitt_nutri.example.demo.observer;

import fitt_nutri.example.demo.model.FormModel;

public interface Subject {
    void register(Observer observer);
    void unregister(Observer observer);
    void notifyObservers(FormModel form);
}
