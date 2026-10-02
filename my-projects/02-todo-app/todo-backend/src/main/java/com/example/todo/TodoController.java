package com.example.todo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
public class TodoController {

    @Autowired
    private TodoRepository todoRepository;

    @GetMapping
    public List<Todo> getAllTodos(Authentication authentication) {
        if (authentication == null) return List.of();
        User user = (User) authentication.getPrincipal();
        return todoRepository.findByUser(user);
    }

    @PostMapping
    public ResponseEntity<?> createTodo(@RequestBody Todo todo, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        User user = (User) authentication.getPrincipal();
        todo.setUser(user);
        Todo savedTodo = todoRepository.save(todo);
        return ResponseEntity.ok(savedTodo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        todoRepository.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}
