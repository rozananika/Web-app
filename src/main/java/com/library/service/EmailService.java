package com.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        emailSender.send(message);
    }

    public void sendOverdueNotification(String to, String bookTitle, String dueDate) {
        String subject = "Library Book Overdue Notice";
        String text = String.format(
            "Dear Library Member,\n\n" +
            "This is a reminder that the following book is overdue:\n" +
            "Book: %s\n" +
            "Due Date: %s\n\n" +
            "Please return the book as soon as possible to avoid any penalties.\n\n" +
            "Best regards,\n" +
            "Your Library Team",
            bookTitle, dueDate
        );
        sendSimpleMessage(to, subject, text);
    }

    public void sendDueDateReminder(String to, String bookTitle, String dueDate) {
        String subject = "Library Book Due Date Reminder";
        String text = String.format(
            "Dear Library Member,\n\n" +
            "This is a friendly reminder that the following book is due soon:\n" +
            "Book: %s\n" +
            "Due Date: %s\n\n" +
            "Please return the book by the due date to avoid any late fees.\n\n" +
            "Best regards,\n" +
            "Your Library Team",
            bookTitle, dueDate
        );
        sendSimpleMessage(to, subject, text);
    }
}
